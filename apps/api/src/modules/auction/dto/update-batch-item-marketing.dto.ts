import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateBatchItemMarketingDto {
  @IsOptional()
  @IsString()
  marketingNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  marketingAssets?: string[];
}
