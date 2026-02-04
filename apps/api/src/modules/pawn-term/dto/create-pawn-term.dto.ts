import {
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  tenorDefault: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interestRate: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  adminFee: number = 0;
}
