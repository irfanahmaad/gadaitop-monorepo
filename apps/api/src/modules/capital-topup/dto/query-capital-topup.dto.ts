import { IsOptional, IsUUID, IsEnum } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { CapitalTopupStatusEnum } from '../../../constants/capital-topup-status';

export class QueryCapitalTopupDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsEnum(CapitalTopupStatusEnum)
  status?: CapitalTopupStatusEnum;
}
