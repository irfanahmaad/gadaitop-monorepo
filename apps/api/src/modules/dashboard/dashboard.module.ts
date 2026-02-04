import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { NkbRecordEntity } from '../nkb/entities/nkb-record.entity';
import { CashMutationEntity } from '../cash-mutation/entities/cash-mutation.entity';
import { BranchEntity } from '../branch/entities/branch.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpkRecordEntity,
      NkbRecordEntity,
      CashMutationEntity,
      BranchEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
