import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { ApiConfigService } from '../../shared/services/api-config.service';
import { PresignedUrlResponseDto } from './dto/presigned-url-response.dto';

const DEFAULT_EXPIRES_IN = 900;
const MAX_EXPIRES_IN = 604800;

/**
 * Shared upload service for S3 (or S3-compatible) storage.
 * Use presigned URLs so clients upload directly; entities store the key or public URL.
 */
@Injectable()
export class UploadService {
  private s3Client: S3Client | null = null;
  private bucket: string | null = null;
  private keyPrefix: string = '';

  constructor(private configService: ApiConfigService) {
    const config = this.configService.s3Config;
    if (config) {
      this.bucket = config.bucket;
      this.keyPrefix = (config.keyPrefix ?? '').replace(/\/$/, '');
      this.s3Client = new S3Client({
        region: config.region,
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
        ...(config.accessKeyId && config.secretAccessKey && {
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        }),
        ...(config.endpoint && { endpoint: config.endpoint }),
        forcePathStyle: !!config.endpoint,
      });
    }
  }

  /**
   * Check if S3 is configured.
   */
  isConfigured(): boolean {
    return this.s3Client !== null && this.bucket !== null;
  }

  /**
   * Get a presigned PUT URL for client-side upload. Caller stores the returned `key`
   * in entity fields (e.g. ktp_photo_url, payment_proof_url, evidence_photos, validation_photos).
   */
  async getPresignedUploadUrl(
    key: string,
    options?: { contentType?: string; expiresIn?: number },
  ): Promise<PresignedUrlResponseDto> {
    if (!this.s3Client || !this.bucket) {
      throw new ServiceUnavailableException(
        'S3 is not configured. Set S3_BUCKET and S3_REGION.',
      );
    }

    const fullKey = this.keyPrefix ? `${this.keyPrefix}/${key}` : key;
    const expiresIn = Math.min(
      options?.expiresIn ?? DEFAULT_EXPIRES_IN,
      MAX_EXPIRES_IN,
    );
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fullKey,
      ...(options?.contentType && { ContentType: options.contentType }),
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });

    return new PresignedUrlResponseDto({
      url,
      key: fullKey,
      expiresAt: expiresAt.toISOString(),
    });
  }

  /**
   * Upload a file directly to S3 from the server.
   * Returns the full S3 key (with prefix).
   */
  async uploadFile(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<{ key: string; url: string }> {
    if (!this.s3Client || !this.bucket) {
      throw new ServiceUnavailableException(
        'S3 is not configured. Set AWS_S3_BUCKET_NAME and AWS_S3_BUCKET_REGION.',
      );
    }

    const fullKey = this.keyPrefix ? `${this.keyPrefix}/${key}` : key;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fullKey,
      Body: body,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    return {
      key: fullKey,
      url: await this.getPublicUrl(fullKey),
    };
  }

  /**
   * Build a presigned GET URL for a stored key.
   * Works with private buckets — returns a time-limited signed URL.
   */
  async getPublicUrl(key: string): Promise<string> {
    if (!this.s3Client || !this.bucket) {
      throw new BadRequestException('S3 is not configured.');
    }

    // If a public base URL is configured (e.g. CDN), use it directly
    const base = this.configService.getOptional('S3_PUBLIC_BASE_URL');
    if (base) {
      return `${base.replace(/\/$/, '')}/${key}`;
    }

    // Otherwise generate a presigned GET URL (1 hour)
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
