import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { SpkStatusEnum } from '../../../constants/spk-status';

export class QuerySpkDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsEnum(SpkStatusEnum)
  status?: SpkStatusEnum;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
