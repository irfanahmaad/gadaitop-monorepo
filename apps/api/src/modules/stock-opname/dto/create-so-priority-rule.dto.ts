import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

import { SoPriorityRuleTypeEnum } from '../../../constants/so-priority-rule-type';

export class CreateSoPriorityRuleDto {
  @IsUUID()
  ptId: string;

  @IsString()
  ruleName: string;

  @IsEnum(SoPriorityRuleTypeEnum)
  ruleType: SoPriorityRuleTypeEnum;

  @IsObject()
  ruleConfig: Record<string, unknown>;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  priorityLevel: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
