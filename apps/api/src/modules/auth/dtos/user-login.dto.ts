import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UserLoginDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  readonly password!: string;

  @IsBoolean()
  @IsOptional()
  readonly isAdmin?: boolean;
}
