import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { SoPriorityRuleTypeEnum } from '../../../constants/so-priority-rule-type';

export class UpdateSoPriorityRuleDto {
  @IsOptional()
  @IsString()
  ruleName?: string;

  @IsOptional()
  @IsEnum(SoPriorityRuleTypeEnum)
  ruleType?: SoPriorityRuleTypeEnum;

  @IsOptional()
  @IsObject()
  ruleConfig?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  priorityLevel?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
