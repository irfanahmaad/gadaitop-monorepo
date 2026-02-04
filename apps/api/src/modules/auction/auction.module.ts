import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuctionBatchEntity } from './entities/auction-batch.entity';
import { AuctionBatchItemEntity } from './entities/auction-batch-item.entity';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { SpkItemEntity } from '../spk/entities/spk-item.entity';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuctionBatchEntity,
      AuctionBatchItemEntity,
      SpkRecordEntity,
      SpkItemEntity,
    ]),
  ],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionModule {}
