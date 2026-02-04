import { Factory } from '@concepta/typeorm-seeding';

import { SpkItemEntity } from '../../modules/spk/entities/spk-item.entity';

export class SpkItemFactory extends Factory<SpkItemEntity> {
  protected async entity(): Promise<SpkItemEntity> {
    const item = new SpkItemEntity();
    return Promise.resolve(item);
  }
}
