import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateStockOpnameSessionDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one store must be selected' })
  @IsUUID('4', { each: true })
  storeIds?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assignedToIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
