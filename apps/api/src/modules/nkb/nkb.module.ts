import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NkbRecordEntity } from './entities/nkb-record.entity';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { NkbController } from './nkb.controller';
import { NkbService } from './nkb.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NkbRecordEntity, SpkRecordEntity]),
  ],
  controllers: [NkbController],
  providers: [NkbService],
  exports: [NkbService],
})
export class NkbModule {}
