import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchEntity } from './entities/branch.entity';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { BorrowRequestModule } from '../borrow-request/borrow-request.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchEntity]),
    BorrowRequestModule,
  ],
  controllers: [BranchController],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
