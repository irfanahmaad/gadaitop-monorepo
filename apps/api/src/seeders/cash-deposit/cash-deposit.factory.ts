import { Factory } from '@concepta/typeorm-seeding';

import { CashDepositEntity } from '../../modules/cash-deposit/entities/cash-deposit.entity';

export class CashDepositFactory extends Factory<CashDepositEntity> {
  protected async entity(): Promise<CashDepositEntity> {
    const entity = new CashDepositEntity();
    return Promise.resolve(entity);
  }
}
