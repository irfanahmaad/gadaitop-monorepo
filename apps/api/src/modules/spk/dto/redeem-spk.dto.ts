import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Optional amount override for full redemption (default: remaining balance).
 */
export class RedeemSpkDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amountPaid?: number;
}
