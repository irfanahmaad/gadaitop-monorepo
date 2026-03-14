import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateBatchMarketingDto {
  @IsOptional()
  @IsString()
  marketingNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  marketingAssets?: string[];
}
