import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  branchCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  shortName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsOptional()
  @IsBoolean()
  isBorrowed?: boolean;

  @IsOptional()
  @IsUUID()
  actualOwnerId?: string;
}
