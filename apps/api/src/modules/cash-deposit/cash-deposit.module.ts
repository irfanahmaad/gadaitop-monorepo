import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchEntity } from '../branch/entities/branch.entity';
import { UserEntity } from '../user/entities/user.entity';
import { CashMutationModule } from '../cash-mutation/cash-mutation.module';
import { NotificationModule } from '../notification/notification.module';
import { CashDepositEntity } from './entities/cash-deposit.entity';
import { CashDepositController } from './cash-deposit.controller';
import { CashDepositService } from './cash-deposit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashDepositEntity, BranchEntity, UserEntity]),
    CashMutationModule,
    NotificationModule,
    // XenditModule is @Global(), no need to import explicitly
  ],
  controllers: [CashDepositController],
  providers: [CashDepositService],
  exports: [CashDepositService],
})
export class CashDepositModule {}
