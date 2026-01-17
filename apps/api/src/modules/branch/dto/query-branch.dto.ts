import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { BranchStatusEnum } from '../../../constants/branch-status';

export class QueryBranchDto extends PageOptionsDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(BranchStatusEnum)
  @Type(() => String)
  status?: BranchStatusEnum;

  @IsOptional()
  @IsString()
  search?: string; // For branchCode or name search
}
