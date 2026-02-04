import { IsArray, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StockOpnameItemUpdateDto {
  @IsUUID()
  itemId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  countedQuantity: number;
}

export class UpdateStockOpnameItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockOpnameItemUpdateDto)
  items: StockOpnameItemUpdateDto[];
}
