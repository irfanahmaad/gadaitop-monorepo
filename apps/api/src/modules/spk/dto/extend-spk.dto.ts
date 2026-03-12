import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { NkbPaymentMethodEnum } from '../../../constants/nkb-payment-method';

/** Minimum principal payment for perpanjangan (spec: Rp 50.000). */
const MIN_PRINCIPAL_PAYMENT = 50_000;

/**
 * Payment amount for SPK extension (renewal).
 * Spec: batas bawah pokok Rp 50.000.
 */
export class ExtendSpkDto {
  @IsNumber()
  @Min(MIN_PRINCIPAL_PAYMENT, {
    message: `Minimum payment for renewal is Rp ${MIN_PRINCIPAL_PAYMENT.toLocaleString('id-ID')}`,
  })
  @Type(() => Number)
  amountPaid: number;

  @IsOptional()
  @IsEnum(NkbPaymentMethodEnum)
  paymentMethod?: NkbPaymentMethodEnum;
}
