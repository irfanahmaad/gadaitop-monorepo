import { IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCapitalTopupDto {
  @IsUUID()
  storeId: string;

  @IsUUID()
  ptId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsString()
  reason: string;
}
