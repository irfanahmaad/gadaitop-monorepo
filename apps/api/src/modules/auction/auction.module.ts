import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpkModule } from '../spk/spk.module';
import { AuctionBatchAssigneeEntity } from './entities/auction-batch-assignee.entity';
import { AuctionBatchEntity } from './entities/auction-batch.entity';
import { AuctionBatchItemEntity } from './entities/auction-batch-item.entity';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuctionBatchEntity,
      AuctionBatchAssigneeEntity,
      AuctionBatchItemEntity,
    ]),
    SpkModule,
  ],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionModule {}
