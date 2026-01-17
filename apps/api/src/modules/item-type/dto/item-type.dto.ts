import { ItemTypeEntity } from '../entities/item-type.entity';

export class ItemTypeDto extends ItemTypeEntity {
  constructor(itemType: ItemTypeEntity) {
    super();
    Object.assign(this, itemType);
  }
}
