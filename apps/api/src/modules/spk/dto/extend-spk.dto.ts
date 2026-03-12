import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { NkbPaymentMethodEnum } from '../../../constants/nkb-payment-method';

/**
 * Payment amount for SPK extension (renewal).
 */
export class ExtendSpkDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amountPaid: number;

  @IsOptional()
  @IsEnum(NkbPaymentMethodEnum)
  paymentMethod?: NkbPaymentMethodEnum;
}
