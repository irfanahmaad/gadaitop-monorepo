import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { CashMutationCategoryEnum } from '../../../constants/cash-mutation-category';
import { CashMutationTypeEnum } from '../../../constants/cash-mutation-type';

export class QueryCashMutationDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsEnum(CashMutationTypeEnum)
  mutationType?: CashMutationTypeEnum;

  @IsOptional()
  @IsEnum(CashMutationCategoryEnum)
  category?: CashMutationCategoryEnum;
}
