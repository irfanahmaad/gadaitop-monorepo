import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateStockOpnameSessionDto {
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
