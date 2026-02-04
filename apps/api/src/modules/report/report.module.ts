import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CashMutationModule } from '../cash-mutation/cash-mutation.module';
import { CashMutationEntity } from '../cash-mutation/entities/cash-mutation.entity';
import { BranchEntity } from '../branch/entities/branch.entity';
import { SpkModule } from '../spk/spk.module';
import { NkbModule } from '../nkb/nkb.module';
import { StockOpnameModule } from '../stock-opname/stock-opname.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashMutationEntity, BranchEntity]),
    CashMutationModule,
    SpkModule,
    NkbModule,
    StockOpnameModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
