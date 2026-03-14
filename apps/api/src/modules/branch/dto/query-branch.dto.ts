import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

import { PageOptionsDto } from '../../../common/dtos/page-options.dto';
import { BranchStatusEnum } from '../../../constants/branch-status';

export const BranchListView = {
  Company: 'company',
  BorrowedByMe: 'borrowedByMe',
} as const;
export type BranchListViewType = (typeof BranchListView)[keyof typeof BranchListView];

export class QueryBranchDto extends PageOptionsDto {
  /** When 'borrowedByMe', list branches where actualOwnerId = current user (Toko Pinjaman). Default 'company' = list by companyId. */
  @IsOptional()
  @IsIn([BranchListView.Company, BranchListView.BorrowedByMe])
  view?: BranchListViewType;

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
