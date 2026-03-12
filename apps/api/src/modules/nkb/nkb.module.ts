import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchEntity } from '../branch/entities/branch.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { InterestCalculatorService } from '../spk/services/interest-calculator.service';
import { SpkModule } from '../spk/spk.module';
import { NkbRecordEntity } from './entities/nkb-record.entity';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { NkbController } from './nkb.controller';
import { NkbService } from './nkb.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NkbRecordEntity,
      SpkRecordEntity,
      CompanyEntity,
      BranchEntity,
    ]),
    SpkModule,
  ],
  controllers: [NkbController],
  providers: [NkbService],
  exports: [NkbService],
})
export class NkbModule {}
