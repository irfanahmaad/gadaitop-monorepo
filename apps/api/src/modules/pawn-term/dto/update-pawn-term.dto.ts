import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePawnTermDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  loanLimitMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  loanLimitMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tenorDefault?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  adminFee?: number;
}
