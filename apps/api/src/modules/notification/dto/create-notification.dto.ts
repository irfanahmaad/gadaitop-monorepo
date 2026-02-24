import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  recipientId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  relatedEntityType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  relatedEntityId?: string;
}
