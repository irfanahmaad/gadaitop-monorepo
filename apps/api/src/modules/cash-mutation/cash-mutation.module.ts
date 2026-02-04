import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CashMutationEntity } from './entities/cash-mutation.entity';
import { CashMutationController } from './cash-mutation.controller';
import { CashMutationService } from './cash-mutation.service';

@Module({
  imports: [TypeOrmModule.forFeature([CashMutationEntity])],
  controllers: [CashMutationController],
  providers: [CashMutationService],
  exports: [CashMutationService],
})
export class CashMutationModule {}
