import {
  IsArray,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateSpkItemDto } from './create-spk-item.dto';

export class CreateSpkDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  storeId: string;

  @IsUUID()
  ptId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  principalAmount: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tenor: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  adminFee?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpkItemDto)
  items: CreateSpkItemDto[];
}
