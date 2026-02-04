import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { AuctionValidationVerdictEnum } from '../../../constants/auction-validation-verdict';

export class SubmitValidationDto {
  @IsEnum(AuctionValidationVerdictEnum)
  verdict: AuctionValidationVerdictEnum;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  validationPhotos?: string[];
}
