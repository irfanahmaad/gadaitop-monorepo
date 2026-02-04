import { CustomerEntity } from '../entities/customer.entity';

export class CustomerDto extends CustomerEntity {
  constructor(customer: CustomerEntity) {
    super();
    Object.assign(this, customer);
  }
}
