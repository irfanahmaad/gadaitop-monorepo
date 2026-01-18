import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO for creating a company along with its Admin Primary (owner) user.
 * This is used when creating a new PT from the Master PT page.
 */
export class CreateCompanyWithAdminDto {
  // ============================================
  // COMPANY DATA
  // ============================================

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  companyCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  companyName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  companyEmail?: string;

  // ============================================
  // ADMIN PRIMARY (OWNER) DATA
  // ============================================

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  adminName: string;

  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  adminPhone?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
