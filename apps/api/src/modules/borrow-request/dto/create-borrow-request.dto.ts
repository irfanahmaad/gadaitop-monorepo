import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBorrowRequestDto {
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @IsNotEmpty()
  @IsUUID()
  targetCompanyId: string;

  @IsOptional()
  @IsString()
  requestReason?: string;
}
