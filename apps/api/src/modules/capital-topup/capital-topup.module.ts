import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CapitalTopupEntity } from './entities/capital-topup.entity';
import { CapitalTopupController } from './capital-topup.controller';
import { CapitalTopupService } from './capital-topup.service';

@Module({
  imports: [TypeOrmModule.forFeature([CapitalTopupEntity])],
  controllers: [CapitalTopupController],
  providers: [CapitalTopupService],
  exports: [CapitalTopupService],
})
export class CapitalTopupModule {}
