import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum CalculatePaymentType {
  Renewal = 'renewal',
  Redemption = 'redemption',
}

/**
 * Query params for payment calculation preview.
 */
export class CalculatePaymentQueryDto {
  @IsEnum(CalculatePaymentType)
  type: CalculatePaymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amountPaid?: number;
}
