import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { BorrowRequestEntity } from './entities/borrow-request.entity';
import { BorrowRequestService } from './borrow-request.service';
import { BorrowRequestController } from './borrow-request.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BorrowRequestEntity]),
    NotificationModule,
    UserModule,
  ],
  controllers: [BorrowRequestController],
  providers: [BorrowRequestService],
  exports: [BorrowRequestService],
})
export class BorrowRequestModule {}
