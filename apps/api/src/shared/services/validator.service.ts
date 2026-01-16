import { Injectable } from '@nestjs/common';
import { isEmail, isPhoneNumber } from 'class-validator';

@Injectable()
export class ValidatorService {
  isEmail(email: string): boolean {
    return isEmail(email);
  }

  isPhoneNumber(phone: string): boolean {
    return isPhoneNumber(phone);
  }
}
