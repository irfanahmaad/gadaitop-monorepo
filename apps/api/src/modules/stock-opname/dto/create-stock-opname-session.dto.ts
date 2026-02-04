import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStockOpnameSessionDto {
  @IsUUID()
  ptId: string;

  @IsUUID()
  storeId: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
