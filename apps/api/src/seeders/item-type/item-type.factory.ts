import { Factory } from '@concepta/typeorm-seeding';

import { ItemTypeEntity } from '../../modules/item-type/entities/item-type.entity';

export class ItemTypeFactory extends Factory<ItemTypeEntity> {
  protected async entity(): Promise<ItemTypeEntity> {
    const itemType = new ItemTypeEntity();

    return Promise.resolve(itemType);
  }
}
