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
  store?: { uuid: string; shortName: string; fullName: string; branchCode: string };
  creator?: { uuid: string; fullName: string; imageUrl: string | null };

  constructor(record: CashMutationEntity & { store?: any; creator?: any }) {
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
    if (record.store) {
      this.store = {
        uuid: record.store.uuid,
        shortName: record.store.shortName,
        fullName: record.store.fullName,
        branchCode: record.store.branchCode,
      };
    }
    if (record.creator) {
      this.creator = {
        uuid: record.creator.uuid,
        fullName: record.creator.fullName,
        imageUrl: record.creator.imageUrl ?? null,
      };
    }
  }
}
