import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

import { UploadService } from './upload.service';
import { PresignedUrlRequestDto } from './dto/presigned-url-request.dto';
import { PresignedUrlResponseDto } from './dto/presigned-url-response.dto';

/**
 * Upload endpoints: presigned URL for client uploads; optional public URL helper.
 * Other modules (Customer, NKB, StockOpname, Auction) use UploadService to get URLs
 * and store returned keys in entity fields.
 */
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload a file through the backend to S3.
   * Accepts multipart/form-data with a `file` field and optional `key` field.
   * Returns the S3 key and public URL.
   */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('key') key?: string,
  ): Promise<{ key: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Use provided key or generate one from timestamp + original name
    const fileKey =
      key || `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

    return this.uploadService.uploadFile(fileKey, file.buffer, file.mimetype);
  }

  /**
   * Get a presigned PUT URL. Client uploads file with PUT to the returned URL.
   * Store the returned `key` in your entity (e.g. ktp_photo_url, payment_proof_url).
   */
  @Post('presigned')
  async getPresignedUrl(
    @Body() dto: PresignedUrlRequestDto,
  ): Promise<PresignedUrlResponseDto> {
    return this.uploadService.getPresignedUploadUrl(dto.key, {
      contentType: dto.contentType,
      expiresIn: dto.expiresIn,
    });
  }

  /**
   * Get public URL for a stored key (for display/download). Optional query ?key=
   */
  @Get('public-url')
  async getPublicUrl(@Query('key') key: string): Promise<{ url: string }> {
    if (!key) {
      return { url: '' };
    }
    return { url: await this.uploadService.getPublicUrl(key) };
  }

  /**
   * Health: whether S3 upload is configured.
   */
  @Get('status')
  status(): { configured: boolean } {
    return { configured: this.uploadService.isConfigured() };
  }
}
