import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

import { GenderEnum } from '../../../constants/gender';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  @Length(16, 20)
  nik: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  pin: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsDateString()
  dob: string;

  @IsNotEmpty()
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ktpPhotoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  selfiePhotoUrl?: string;

  @IsNotEmpty()
  @IsUUID()
  ptId: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
