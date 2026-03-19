import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../user/entities/user.entity';
import { CashMutationModule } from '../cash-mutation/cash-mutation.module';
import { NotificationModule } from '../notification/notification.module';
import { CapitalTopupEntity } from './entities/capital-topup.entity';
import { CapitalTopupController } from './capital-topup.controller';
import { CapitalTopupService } from './capital-topup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CapitalTopupEntity, UserEntity]),
    CashMutationModule,
    NotificationModule,
  ],
  controllers: [CapitalTopupController],
  providers: [CapitalTopupService],
  exports: [CapitalTopupService],
})
export class CapitalTopupModule {}
