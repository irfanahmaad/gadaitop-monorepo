import { IsOptional, IsUUID, IsEnum, IsString, Matches } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { NkbPaymentTypeEnum } from '../../../constants/nkb-payment-type';
import { NkbStatusEnum } from '../../../constants/nkb-status';

const statusEnumValues = Object.values(NkbStatusEnum).join('|');

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

  /** Comma-separated statuses, e.g. "confirmed,rejected". When set, takes precedence over status. */
  @IsOptional()
  @IsString()
  @Matches(new RegExp(`^(${statusEnumValues})(,(${statusEnumValues}))*$`), {
    message: `statusIn must be comma-separated values of: ${statusEnumValues}`,
  })
  statusIn?: string;

  @IsOptional()
  @IsEnum(NkbPaymentTypeEnum)
  paymentType?: NkbPaymentTypeEnum;
}
