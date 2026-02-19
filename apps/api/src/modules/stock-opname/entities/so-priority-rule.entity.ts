import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { SoPriorityRuleTypeEnum } from '../../../constants/so-priority-rule-type';

@Entity({ name: 'so_priority_rules' })
@Index(['ptId', 'priorityLevel'])
export class SoPriorityRuleEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  ptId: string;

  @ManyToOne('CompanyEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pt_id', referencedColumnName: 'uuid' })
  pt: Relation<any>;

  @Column({ type: 'varchar', length: 255 })
  ruleName: string;

  @Column({ type: 'enum', enum: SoPriorityRuleTypeEnum })
  ruleType: SoPriorityRuleTypeEnum;

  @Column({ type: 'jsonb' })
  ruleConfig: Record<string, unknown>;

  @Column({ type: 'smallint' })
  @Index()
  priorityLevel: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
