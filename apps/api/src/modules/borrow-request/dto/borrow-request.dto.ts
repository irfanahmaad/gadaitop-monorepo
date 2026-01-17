import { BorrowRequestEntity } from '../entities/borrow-request.entity';

export class BorrowRequestDto extends BorrowRequestEntity {
  constructor(borrowRequest: BorrowRequestEntity) {
    super();
    Object.assign(this, borrowRequest);
  }
}
