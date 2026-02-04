import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerEntity } from './entities/customer.entity';
import { CustomerPinHistoryEntity } from './entities/customer-pin-history.entity';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerEntity, CustomerPinHistoryEntity]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
