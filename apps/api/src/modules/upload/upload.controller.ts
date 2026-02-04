import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

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
  getPublicUrl(@Query('key') key: string): { url: string } {
    if (!key) {
      return { url: '' };
    }
    return { url: this.uploadService.getPublicUrl(key) };
  }

  /**
   * Health: whether S3 upload is configured.
   */
  @Get('status')
  status(): { configured: boolean } {
    return { configured: this.uploadService.isConfigured() };
  }
}
