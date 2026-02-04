import { IsDateString, IsOptional, IsUUID } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';

export class QueryReportDto extends PageOptionsDto {
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;
}
