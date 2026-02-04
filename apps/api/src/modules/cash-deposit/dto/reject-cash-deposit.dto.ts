import { IsOptional, IsString } from 'class-validator';

export class RejectCashDepositDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
