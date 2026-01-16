import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  readonly password!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
