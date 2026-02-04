import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { CashDepositPaymentMethodEnum } from '../../../constants/cash-deposit-payment-method';

export class CreateCashDepositDto {
  @IsUUID()
  storeId: string;

  @IsUUID()
  ptId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsEnum(CashDepositPaymentMethodEnum)
  paymentMethod: CashDepositPaymentMethodEnum;

  @IsOptional()
  @IsString()
  paymentChannel?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
