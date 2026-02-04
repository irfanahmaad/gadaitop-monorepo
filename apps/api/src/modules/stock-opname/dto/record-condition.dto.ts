import { IsEnum, IsOptional, IsString } from 'class-validator';

import { SpkItemConditionEnum } from '../../../constants/spk-item-condition';

export class RecordConditionDto {
  @IsEnum(SpkItemConditionEnum)
  conditionAfter: SpkItemConditionEnum;

  @IsOptional()
  @IsString()
  conditionNotes?: string;

  @IsOptional()
  damagePhotos?: string[];
}
