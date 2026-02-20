import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PAWN_TERM_ITEM_CONDITION_VALUES } from './create-pawn-term.dto';

export class UpdatePawnTermDto {
  @IsOptional()
  @IsString()
  ruleName?: string;

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
  tenorMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tenorMax?: number;

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

  @IsOptional()
  @IsString()
  @IsIn(PAWN_TERM_ITEM_CONDITION_VALUES)
  itemCondition?: string;
}
