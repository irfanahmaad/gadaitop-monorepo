import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  readonly password!: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
