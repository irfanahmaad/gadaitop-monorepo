import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAuctionBatchDto {
  @IsUUID()
  storeId: string;

  @IsUUID()
  ptId: string;

  /** SPK item UUIDs to include (must be from overdue SPK, in_storage). */
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1, { message: 'At least one spkItemId is required' })
  spkItemIds: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
