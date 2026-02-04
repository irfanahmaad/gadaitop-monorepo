import { Factory } from '@concepta/typeorm-seeding';

import { StockOpnameItemEntity } from '../../modules/stock-opname/entities/stock-opname-item.entity';

export class StockOpnameItemFactory extends Factory<StockOpnameItemEntity> {
  protected async entity(): Promise<StockOpnameItemEntity> {
    const item = new StockOpnameItemEntity();
    return Promise.resolve(item);
  }
}
