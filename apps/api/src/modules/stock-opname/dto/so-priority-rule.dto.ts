import { SoPriorityRuleTypeEnum } from '../../../constants/so-priority-rule-type';
import { SoPriorityRuleEntity } from '../entities/so-priority-rule.entity';

export class SoPriorityRuleDto {
  uuid: string;
  ptId: string;
  ruleName: string;
  ruleType: SoPriorityRuleTypeEnum;
  ruleConfig: Record<string, unknown>;
  priorityLevel: number;
  isActive: boolean;
  description: string | null;

  constructor(rule: SoPriorityRuleEntity) {
    this.uuid = rule.uuid;
    this.ptId = rule.ptId;
    this.ruleName = rule.ruleName;
    this.ruleType = rule.ruleType;
    this.ruleConfig = rule.ruleConfig;
    this.priorityLevel = rule.priorityLevel;
    this.isActive = rule.isActive;
    this.description = rule.description ?? null;
  }
}
