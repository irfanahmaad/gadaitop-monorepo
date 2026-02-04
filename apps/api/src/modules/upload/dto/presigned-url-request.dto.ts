import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PresignedUrlRequestDto {
  /**
   * S3 object key (path). Will be prefixed with S3_KEY_PREFIX if configured.
   */
  @IsString()
  key!: string;

  /**
   * Content-Type for the upload (e.g. image/jpeg, application/pdf).
   */
  @IsOptional()
  @IsString()
  contentType?: string;

  /**
   * URL expiry in seconds (default 900, max 604800).
   */
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(604800)
  expiresIn?: number;
}
