import { Factory } from '@concepta/typeorm-seeding';

import { generateHash } from '../../common/utils';
import { CustomerEntity } from '../../modules/customer/entities/customer.entity';

export class CustomerFactory extends Factory<CustomerEntity> {
  protected async entity(): Promise<CustomerEntity> {
    const customer = new CustomerEntity();
    return Promise.resolve(customer);
  }

  protected async preProcess(customer: CustomerEntity): Promise<CustomerEntity> {
    // Hash the PIN if provided
    if ((customer as any).pin) {
      customer.pinHash = await generateHash((customer as any).pin);
      delete (customer as any).pin;
    }
    // Hash the password if provided
    if ((customer as any).password) {
      customer.passwordHash = await generateHash((customer as any).password);
      delete (customer as any).password;
    }
    return customer;
  }
}
