import { IsOptional, IsUUID, IsEnum } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { NkbPaymentTypeEnum } from '../../../constants/nkb-payment-type';
import { NkbStatusEnum } from '../../../constants/nkb-status';

export class QueryNkbDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  spkId?: string;

  @IsOptional()
  @IsEnum(NkbStatusEnum)
  status?: NkbStatusEnum;

  @IsOptional()
  @IsEnum(NkbPaymentTypeEnum)
  paymentType?: NkbPaymentTypeEnum;
}
