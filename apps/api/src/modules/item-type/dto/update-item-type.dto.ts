import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateItemTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  typeName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;
}
