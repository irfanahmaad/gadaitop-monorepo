import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CashMutationCategoryEnum } from '../../../constants/cash-mutation-category';
import { CashMutationTypeEnum } from '../../../constants/cash-mutation-type';

export class CreateCashMutationDto {
  @IsUUID()
  storeId: string;

  @IsEnum(CashMutationTypeEnum)
  mutationType: CashMutationTypeEnum;

  @IsEnum(CashMutationCategoryEnum)
  category: CashMutationCategoryEnum;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
