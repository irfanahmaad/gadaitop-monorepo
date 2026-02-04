import { CashDepositPaymentMethodEnum } from '../../../constants/cash-deposit-payment-method';
import { CashDepositStatusEnum } from '../../../constants/cash-deposit-status';
import { CashDepositEntity } from '../entities/cash-deposit.entity';

export class CashDepositDto {
  uuid: string;
  depositCode: string;
  storeId: string;
  ptId: string;
  amount: string;
  paymentMethod: CashDepositPaymentMethodEnum;
  paymentChannel: string | null;
  qrCodeUrl: string | null;
  virtualAccount: string | null;
  paymentProofUrl: string | null;
  status: CashDepositStatusEnum;
  requestedBy: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  store?: { uuid: string; shortName: string; branchCode: string };
  pt?: { uuid: string; companyName: string };

  constructor(record: CashDepositEntity & { store?: any; pt?: any }) {
    this.uuid = record.uuid;
    this.depositCode = record.depositCode;
    this.storeId = record.storeId;
    this.ptId = record.ptId;
    this.amount = record.amount;
    this.paymentMethod = record.paymentMethod;
    this.paymentChannel = record.paymentChannel ?? null;
    this.qrCodeUrl = record.qrCodeUrl ?? null;
    this.virtualAccount = record.virtualAccount ?? null;
    this.paymentProofUrl = record.paymentProofUrl ?? null;
    this.status = record.status;
    this.requestedBy = record.requestedBy;
    this.approvedBy = record.approvedBy ?? null;
    this.approvedAt = record.approvedAt ?? null;
    this.notes = record.notes ?? null;
    this.rejectionReason = record.rejectionReason ?? null;
    this.createdAt = record.createdAt;
    if (record.store) {
      this.store = {
        uuid: record.store.uuid,
        shortName: record.store.shortName,
        branchCode: record.store.branchCode,
      };
    }
    if (record.pt) {
      this.pt = {
        uuid: record.pt.uuid,
        companyName: record.pt.companyName,
      };
    }
  }
}
