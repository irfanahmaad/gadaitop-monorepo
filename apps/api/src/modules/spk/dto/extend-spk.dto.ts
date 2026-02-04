import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Payment amount for SPK extension (renewal).
 */
export class ExtendSpkDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amountPaid: number;
}
