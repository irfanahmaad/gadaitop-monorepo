import { IsOptional, IsUUID, IsEnum } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { CashDepositStatusEnum } from '../../../constants/cash-deposit-status';

export class QueryCashDepositDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsEnum(CashDepositStatusEnum)
  status?: CashDepositStatusEnum;
}
