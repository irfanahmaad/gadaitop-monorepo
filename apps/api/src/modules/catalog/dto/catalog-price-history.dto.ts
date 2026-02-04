import { CatalogPriceHistoryEntity } from '../entities/catalog-price-history.entity';

export class CatalogPriceHistoryDto extends CatalogPriceHistoryEntity {
  constructor(history: CatalogPriceHistoryEntity) {
    super();
    Object.assign(this, history);
  }
}
