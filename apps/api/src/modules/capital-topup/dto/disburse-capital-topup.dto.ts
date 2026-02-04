import { IsOptional, IsString } from 'class-validator';

export class DisburseCapitalTopupDto {
  @IsOptional()
  @IsString()
  disbursementProofUrl?: string;
}
