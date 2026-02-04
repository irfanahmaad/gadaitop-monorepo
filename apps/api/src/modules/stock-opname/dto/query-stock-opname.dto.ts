import { IsOptional, IsUUID, IsEnum } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { StockOpnameSessionStatusEnum } from '../../../constants/stock-opname-session-status';

export class QueryStockOpnameDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsEnum(StockOpnameSessionStatusEnum)
  status?: StockOpnameSessionStatusEnum;
}
