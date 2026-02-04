import { Factory } from '@concepta/typeorm-seeding';

import { SpkRecordEntity } from '../../modules/spk/entities/spk-record.entity';

export class SpkRecordFactory extends Factory<SpkRecordEntity> {
  protected async entity(): Promise<SpkRecordEntity> {
    const spk = new SpkRecordEntity();
    return Promise.resolve(spk);
  }
}
