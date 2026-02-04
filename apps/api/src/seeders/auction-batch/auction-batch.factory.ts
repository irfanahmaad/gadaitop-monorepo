import { Factory } from '@concepta/typeorm-seeding';

import { AuctionBatchEntity } from '../../modules/auction/entities/auction-batch.entity';

export class AuctionBatchFactory extends Factory<AuctionBatchEntity> {
  protected async entity(): Promise<AuctionBatchEntity> {
    const batch = new AuctionBatchEntity();
    return Promise.resolve(batch);
  }
}
