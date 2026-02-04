import { Factory } from '@concepta/typeorm-seeding';

import { CatalogEntity } from '../../modules/catalog/entities/catalog.entity';

export class CatalogFactory extends Factory<CatalogEntity> {
  protected async entity(): Promise<CatalogEntity> {
    const catalog = new CatalogEntity();
    return Promise.resolve(catalog);
  }
}
