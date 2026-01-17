import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BorrowRequestEntity } from './entities/borrow-request.entity';
import { BorrowRequestService } from './borrow-request.service';
import { BorrowRequestController } from './borrow-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowRequestEntity])],
  controllers: [BorrowRequestController],
  providers: [BorrowRequestService],
  exports: [BorrowRequestService],
})
export class BorrowRequestModule {}
