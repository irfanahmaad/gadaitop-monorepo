export class PresignedUrlResponseDto {
  /** Presigned PUT URL for client to upload the file. */
  url!: string;

  /** Final object key (with prefix) to store in entities (ktp_photo_url, etc.). */
  key!: string;

  /** ISO timestamp when the URL expires. */
  expiresAt!: string;

  constructor(partial: Partial<PresignedUrlResponseDto>) {
    Object.assign(this, partial);
  }
}
