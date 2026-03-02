import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateAuctionBatchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
