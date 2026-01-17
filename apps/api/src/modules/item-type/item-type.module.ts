import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemTypeEntity } from './entities/item-type.entity';
import { ItemTypeService } from './item-type.service';
import { ItemTypeController } from './item-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ItemTypeEntity])],
  controllers: [ItemTypeController],
  providers: [ItemTypeService],
  exports: [ItemTypeService],
})
export class ItemTypeModule {}
