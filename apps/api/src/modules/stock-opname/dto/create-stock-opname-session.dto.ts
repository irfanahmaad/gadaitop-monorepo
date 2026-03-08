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

export class CreateStockOpnameSessionDto {
  @IsUUID()
  ptId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one store must be selected' })
  @IsUUID('4', { each: true })
  storeIds: string[];

  @IsDateString()
  startDate: string;

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
