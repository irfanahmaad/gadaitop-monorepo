import { Factory } from '@concepta/typeorm-seeding';

import { StockOpnameSessionEntity } from '../../modules/stock-opname/entities/stock-opname-session.entity';

export class StockOpnameSessionFactory extends Factory<StockOpnameSessionEntity> {
  protected async entity(): Promise<StockOpnameSessionEntity> {
    const session = new StockOpnameSessionEntity();
    return Promise.resolve(session);
  }
}
