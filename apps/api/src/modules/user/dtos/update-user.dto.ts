import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => o.branchId != null)
  branchId?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.imageUrl != null)
  @IsString()
  @MaxLength(500)
  imageUrl?: string | null;
}
