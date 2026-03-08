import { IsOptional, IsUUID, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { SpkStatusEnum } from '../../../constants/spk-status';

export class QuerySpkDto extends PageOptionsDto {
  @IsOptional()
  @IsUUID()
  ptId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsEnum(SpkStatusEnum)
  status?: SpkStatusEnum;

  /** When true and status=overdue, exclude SPK items that are already in an auction batch (for Daftar Lelang). */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  excludeInAuctionBatch?: boolean;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
