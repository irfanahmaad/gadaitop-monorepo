import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';

export class QueryCatalogDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  itemTypeId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
