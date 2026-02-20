import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export const PAWN_TERM_ITEM_CONDITION_VALUES = ['present_and_matching', 'present_but_mismatch'] as const;
export type PawnTermItemCondition = (typeof PAWN_TERM_ITEM_CONDITION_VALUES)[number];

export class CreatePawnTermDto {
  @IsNotEmpty()
  @IsUUID()
  ptId: string;

  @IsNotEmpty()
  @IsUUID()
  itemTypeId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  loanLimitMin: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  loanLimitMax: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tenorMin: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tenorMax: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interestRate: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  adminFee: number = 0;

  @IsOptional()
  @IsString()
  @IsIn(PAWN_TERM_ITEM_CONDITION_VALUES)
  itemCondition?: PawnTermItemCondition;
}
