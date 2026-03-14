import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateAuctionBatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  marketingStaffIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  auctionStaffIds?: string[];
}
