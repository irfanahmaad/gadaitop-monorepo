import { Factory } from '@concepta/typeorm-seeding';

import { AuctionBatchAssigneeEntity } from '../../modules/auction/entities/auction-batch-assignee.entity';

export class AuctionBatchAssigneeFactory extends Factory<AuctionBatchAssigneeEntity> {
  protected async entity(): Promise<AuctionBatchAssigneeEntity> {
    return Promise.resolve(new AuctionBatchAssigneeEntity());
  }
}
