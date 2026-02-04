import { CapitalTopupStatusEnum } from '../../../constants/capital-topup-status';
import { CapitalTopupEntity } from '../entities/capital-topup.entity';

export class CapitalTopupDto {
  uuid: string;
  topupCode: string;
  storeId: string;
  ptId: string;
  amount: string;
  reason: string;
  status: CapitalTopupStatusEnum;
  requestedBy: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  disbursedAt: Date | null;
  disbursementProofUrl: string | null;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  store?: { uuid: string; shortName: string };
  pt?: { uuid: string; companyName: string };

  constructor(record: CapitalTopupEntity & { store?: any; pt?: any }) {
    this.uuid = record.uuid;
    this.topupCode = record.topupCode;
    this.storeId = record.storeId;
    this.ptId = record.ptId;
    this.amount = record.amount;
    this.reason = record.reason;
    this.status = record.status;
    this.requestedBy = record.requestedBy;
    this.approvedBy = record.approvedBy ?? null;
    this.approvedAt = record.approvedAt ?? null;
    this.disbursedAt = record.disbursedAt ?? null;
    this.disbursementProofUrl = record.disbursementProofUrl ?? null;
    this.notes = record.notes ?? null;
    this.rejectionReason = record.rejectionReason ?? null;
    this.createdAt = record.createdAt;
    if (record.store) {
      this.store = { uuid: record.store.uuid, shortName: record.store.shortName };
    }
    if (record.pt) {
      this.pt = { uuid: record.pt.uuid, companyName: record.pt.companyName };
    }
  }
}
