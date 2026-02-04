import { Factory } from '@concepta/typeorm-seeding';

import { NkbRecordEntity } from '../../modules/nkb/entities/nkb-record.entity';

export class NkbRecordFactory extends Factory<NkbRecordEntity> {
  protected async entity(): Promise<NkbRecordEntity> {
    const nkb = new NkbRecordEntity();
    return Promise.resolve(nkb);
  }
}
