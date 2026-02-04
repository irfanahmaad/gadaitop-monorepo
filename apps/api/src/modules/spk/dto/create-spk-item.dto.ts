import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { SpkItemConditionEnum } from '../../../constants/spk-item-condition';

export class CreateSpkItemDto {
  @IsOptional()
  @IsUUID()
  catalogId?: string;

  @IsUUID()
  itemTypeId: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  appraisedValue: number;

  @IsOptional()
  @IsEnum(SpkItemConditionEnum)
  condition?: SpkItemConditionEnum;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsString()
  purity?: string;

  @IsOptional()
  evidencePhotos?: string[];

  @IsOptional()
  @IsString()
  storageLocation?: string;
}
