import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { AuctionBatchStatusEnum } from '../../../constants/auction-batch-status';
import { AuctionAssigneeRoleEnum } from '../../../constants/auction-assignee-role';

/** Tab filter for Validasi Lelangan (Staf Lelang / Staf Marketing) role-based lists. */
export enum ValidasiLelanganTabEnum {
  Dijadwalkan = 'dijadwalkan',
  WaitingForApproval = 'waiting_for_approval',
  Tervalidasi = 'tervalidasi',
}

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

  /** When set, filter batches assigned to this user (for Staf Lelang / Staf Marketing). */
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  /** Assignee role filter: only batches where user is assigned with this role (use with assignedTo). */
  @IsOptional()
  @IsEnum(AuctionAssigneeRoleEnum)
  assigneeRole?: AuctionAssigneeRoleEnum;

  /** Tab for Validasi Lelangan: dijadwalkan | waiting_for_approval | tervalidasi (use with assignedTo + assigneeRole). */
  @IsOptional()
  @IsEnum(ValidasiLelanganTabEnum)
  tab?: ValidasiLelanganTabEnum;
}
