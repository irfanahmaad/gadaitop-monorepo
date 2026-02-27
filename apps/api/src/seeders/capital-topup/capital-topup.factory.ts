import { Factory } from '@concepta/typeorm-seeding';

import { CapitalTopupEntity } from '../../modules/capital-topup/entities/capital-topup.entity';

export class CapitalTopupFactory extends Factory<CapitalTopupEntity> {
  protected async entity(): Promise<CapitalTopupEntity> {
    const entity = new CapitalTopupEntity();
    return Promise.resolve(entity);
  }
}
