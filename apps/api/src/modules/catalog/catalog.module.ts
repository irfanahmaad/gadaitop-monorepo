import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CatalogEntity } from './entities/catalog.entity';
import { CatalogPriceHistoryEntity } from './entities/catalog-price-history.entity';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CatalogEntity, CatalogPriceHistoryEntity]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
