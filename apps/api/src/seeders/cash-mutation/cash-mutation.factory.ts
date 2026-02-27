import { Factory } from '@concepta/typeorm-seeding';

import { CashMutationEntity } from '../../modules/cash-mutation/entities/cash-mutation.entity';

export class CashMutationFactory extends Factory<CashMutationEntity> {
  protected async entity(): Promise<CashMutationEntity> {
    const entity = new CashMutationEntity();
    return Promise.resolve(entity);
  }
}
