import { IsOptional, IsString } from 'class-validator';

export class RejectNkbDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
