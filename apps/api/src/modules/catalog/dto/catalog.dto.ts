import { CatalogEntity } from '../entities/catalog.entity';

export class CatalogDto extends CatalogEntity {
  constructor(catalog: CatalogEntity) {
    super();
    Object.assign(this, catalog);
  }
}
