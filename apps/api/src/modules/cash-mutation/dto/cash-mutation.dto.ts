import { CashMutationCategoryEnum } from '../../../constants/cash-mutation-category';
import { CashMutationTypeEnum } from '../../../constants/cash-mutation-type';
import { CashMutationEntity } from '../entities/cash-mutation.entity';

export class CashMutationDto {
  id: number;
  ptId: string;
  storeId: string;
  mutationDate: Date;
  mutationType: CashMutationTypeEnum;
  category: CashMutationCategoryEnum;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdBy: string;
  createdAt: Date;

  constructor(record: CashMutationEntity) {
    this.id = record.id;
    this.ptId = record.ptId;
    this.storeId = record.storeId;
    this.mutationDate = record.mutationDate;
    this.mutationType = record.mutationType;
    this.category = record.category;
    this.amount = record.amount;
    this.balanceBefore = record.balanceBefore;
    this.balanceAfter = record.balanceAfter;
    this.description = record.description ?? null;
    this.referenceType = record.referenceType ?? null;
    this.referenceId = record.referenceId ?? null;
    this.createdBy = record.createdBy;
    this.createdAt = record.createdAt;
  }
}
