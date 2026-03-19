import { CashDepositStatusEnum } from '../../../constants/cash-deposit-status';
import { CashDepositEntity } from '../entities/cash-deposit.entity';

export class CashDepositDto {
  uuid: string;
  depositCode: string;
  storeId: string;
  ptId: string;
  amount: string;
  virtualAccount: string | null;
  xenditExternalId: string | null;
  status: CashDepositStatusEnum;
  expiresAt: Date | null;
  requestedBy: string;
  notes: string | null;
  createdAt: Date;
  store?: { uuid: string; shortName: string; branchCode: string; fullName?: string };
  pt?: { uuid: string; companyName: string };
  createdBy?: { fullName: string; email: string; imageUrl?: string | null };

  constructor(record: CashDepositEntity & { store?: any; pt?: any; requester?: any }) {
    this.uuid = record.uuid;
    this.depositCode = record.depositCode;
    this.storeId = record.storeId;
    this.ptId = record.ptId;
    this.amount = record.amount;
    this.virtualAccount = record.virtualAccount ?? null;
    this.xenditExternalId = record.xenditExternalId ?? null;
    this.status = record.status;
    this.expiresAt = record.expiresAt ?? null;
    this.requestedBy = record.requestedBy;
    this.notes = record.notes ?? null;
    this.createdAt = record.createdAt;
    if (record.store) {
      this.store = {
        uuid: record.store.uuid,
        shortName: record.store.shortName,
        branchCode: record.store.branchCode,
        fullName: record.store.fullName,
      };
    }
    if (record.pt) {
      this.pt = {
        uuid: record.pt.uuid,
        companyName: record.pt.companyName,
      };
    }
    if (record.requester) {
      this.createdBy = {
        fullName: record.requester.fullName ?? '',
        email: record.requester.email ?? '',
        imageUrl: record.requester.imageUrl ?? null,
      };
    }
  }
}
