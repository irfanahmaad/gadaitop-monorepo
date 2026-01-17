import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCompanyConfigDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  earlyInterestRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  normalInterestRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  adminFeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  insuranceFee?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  latePenaltyRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrincipalPayment?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  defaultTenorDays?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  earlyPaymentDays?: number;
}
