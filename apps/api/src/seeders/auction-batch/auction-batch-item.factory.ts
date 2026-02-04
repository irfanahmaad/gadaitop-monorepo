import { Factory } from '@concepta/typeorm-seeding';

import { AuctionBatchItemEntity } from '../../modules/auction/entities/auction-batch-item.entity';

export class AuctionBatchItemFactory extends Factory<AuctionBatchItemEntity> {
  protected async entity(): Promise<AuctionBatchItemEntity> {
    const item = new AuctionBatchItemEntity();
    return Promise.resolve(item);
  }
}
