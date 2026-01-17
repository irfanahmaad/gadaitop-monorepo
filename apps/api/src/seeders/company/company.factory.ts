import { Factory } from '@concepta/typeorm-seeding';

import { CompanyEntity } from '../../modules/company/entities/company.entity';

export class CompanyFactory extends Factory<CompanyEntity> {
  protected async entity(): Promise<CompanyEntity> {
    const company = new CompanyEntity();

    return Promise.resolve(company);
  }
}
