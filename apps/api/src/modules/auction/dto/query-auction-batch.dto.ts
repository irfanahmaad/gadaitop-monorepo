import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { AuctionBatchStatusEnum } from '../../../constants/auction-batch-status';

export class QueryAuctionBatchDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  storeId?: string;

  @IsOptional()
  @IsEnum(AuctionBatchStatusEnum)
  status?: AuctionBatchStatusEnum;

  /** When set, filter batches assigned to this user (for StaffLelang). */
  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
