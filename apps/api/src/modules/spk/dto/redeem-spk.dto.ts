import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { NkbPaymentMethodEnum } from '../../../constants/nkb-payment-method';

/**
 * Optional amount override for full redemption (default: remaining balance).
 */
export class RedeemSpkDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amountPaid?: number;

  @IsOptional()
  @IsEnum(NkbPaymentMethodEnum)
  paymentMethod?: NkbPaymentMethodEnum;
}
