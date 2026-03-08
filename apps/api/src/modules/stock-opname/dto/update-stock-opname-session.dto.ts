import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
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
  @IsArray()
  @IsUUID('4', { each: true })
  pawnTermIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  mataItemCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
