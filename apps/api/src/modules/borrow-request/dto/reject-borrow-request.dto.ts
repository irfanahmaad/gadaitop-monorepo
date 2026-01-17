import { IsNotEmpty, IsString } from 'class-validator';

export class RejectBorrowRequestDto {
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
