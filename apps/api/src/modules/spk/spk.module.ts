import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchEntity } from '../branch/entities/branch.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { ItemTypeEntity } from '../item-type/entities/item-type.entity';
import { NkbRecordEntity } from '../nkb/entities/nkb-record.entity';
import { SpkRecordEntity } from './entities/spk-record.entity';
import { SpkItemEntity } from './entities/spk-item.entity';
import { SpkController } from './spk.controller';
import { SpkService } from './spk.service';
import { InterestCalculatorService } from './services/interest-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpkRecordEntity,
      SpkItemEntity,
      NkbRecordEntity,
      CustomerEntity,
      BranchEntity,
      CompanyEntity,
      ItemTypeEntity,
    ]),
  ],
  controllers: [SpkController],
  providers: [SpkService, InterestCalculatorService],
  exports: [SpkService],
})
export class SpkModule {}
