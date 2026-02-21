import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';

export class QueryCustomerDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
