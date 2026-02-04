import { IsOptional, IsString } from 'class-validator';

export class RejectCapitalTopupDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
