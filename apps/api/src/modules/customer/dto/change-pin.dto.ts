import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePinDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  oldPin?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  newPin: string;
}
