import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum CustomerLoginType {
  NikPin = 'nik_pin',
  EmailPassword = 'email_password',
}

export class CustomerLoginDto {
  @IsEnum(CustomerLoginType)
  loginType: CustomerLoginType;

  /** Required when loginType is nik_pin */
  @IsOptional()
  @IsString()
  nik?: string;

  /** Required when loginType is nik_pin */
  @IsOptional()
  @IsString()
  @MinLength(4)
  pin?: string;

  /** Required when loginType is email_password */
  @IsOptional()
  @IsEmail()
  email?: string;

  /** Required when loginType is email_password */
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
