import { CompanyEntity } from '../entities/company.entity';

export class CompanyDto extends CompanyEntity {
  constructor(company: CompanyEntity) {
    super();
    Object.assign(this, company);
  }
}
