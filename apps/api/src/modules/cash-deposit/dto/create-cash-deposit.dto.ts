import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCashDepositDto {
  /** Target branch (store) to request deposit from */
  @IsUUID()
  storeId: string;

  /** PT (company) ID. Optional: resolved from store if omitted. */
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
