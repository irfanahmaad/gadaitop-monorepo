import { Factory } from '@concepta/typeorm-seeding';

import { SoPriorityRuleEntity } from '../../modules/stock-opname/entities/so-priority-rule.entity';

export class SoPriorityRuleFactory extends Factory<SoPriorityRuleEntity> {
  protected async entity(): Promise<SoPriorityRuleEntity> {
    const entity = new SoPriorityRuleEntity();
    return Promise.resolve(entity);
  }
}
