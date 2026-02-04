import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { NkbPaymentMethodEnum } from '../../../constants/nkb-payment-method';
import { NkbPaymentTypeEnum } from '../../../constants/nkb-payment-type';

export class CreateNkbDto {
  @IsUUID()
  spkId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amountPaid: number;

  @IsEnum(NkbPaymentTypeEnum)
  paymentType: NkbPaymentTypeEnum;

  @IsEnum(NkbPaymentMethodEnum)
  paymentMethod: NkbPaymentMethodEnum;
}
