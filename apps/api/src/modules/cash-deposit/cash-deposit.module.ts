import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CashDepositEntity } from './entities/cash-deposit.entity';
import { CashDepositController } from './cash-deposit.controller';
import { CashDepositService } from './cash-deposit.service';

@Module({
  imports: [TypeOrmModule.forFeature([CashDepositEntity])],
  controllers: [CashDepositController],
  providers: [CashDepositService],
  exports: [CashDepositService],
})
export class CashDepositModule {}
