import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';

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
   * Build a public URL for a stored key (if bucket has public read or CDN).
   * Override in subclass or use custom domain env (e.g. S3_PUBLIC_BASE_URL).
   */
  getPublicUrl(key: string): string {
    if (!this.bucket) {
      throw new BadRequestException('S3 is not configured.');
    }
    const base = this.configService.getOptional('S3_PUBLIC_BASE_URL');
    if (base) {
      return `${base.replace(/\/$/, '')}/${key}`;
    }
    const config = this.configService.s3Config;
    const endpoint = config?.endpoint;
    if (endpoint) {
      return `${endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${config?.region ?? 'us-east-1'}.amazonaws.com/${key}`;
  }
}
