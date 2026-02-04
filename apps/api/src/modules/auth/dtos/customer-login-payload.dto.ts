import { CustomerDto } from '../../customer/dto/customer.dto';
import { TokenPayloadDto } from './token-payload.dto';

export class CustomerLoginPayloadDto {
  customer: CustomerDto;
  token: TokenPayloadDto;

  constructor(customer: CustomerDto, token: TokenPayloadDto) {
    this.customer = customer;
    this.token = token;
  }
}
