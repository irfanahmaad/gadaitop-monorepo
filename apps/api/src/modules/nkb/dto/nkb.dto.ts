import { NkbPaymentMethodEnum } from '../../../constants/nkb-payment-method';
import { NkbPaymentTypeEnum } from '../../../constants/nkb-payment-type';
import { NkbStatusEnum } from '../../../constants/nkb-status';
import { NkbRecordEntity } from '../entities/nkb-record.entity';

export class NkbDto {
  uuid: string;
  nkbNumber: string;
  spkId: string;
  amountPaid: string;
  paymentType: NkbPaymentTypeEnum;
  paymentMethod: NkbPaymentMethodEnum;
  paymentProofUrl: string | null;
  transactionRef: string | null;
  status: NkbStatusEnum;
  notes: string | null;
  confirmedAt: Date | null;
  rejectionReason: string | null;
  isCustomerInitiated: boolean;
  createdAt: Date;
  spk?: { uuid: string; spkNumber: string; customerId: string };
  customer?: { uuid: string; name: string; nik: string };

  constructor(record: NkbRecordEntity & { spk?: { customer?: any } }) {
    this.uuid = record.uuid;
    this.nkbNumber = record.nkbNumber;
    this.spkId = record.spkId;
    this.amountPaid = record.amountPaid;
    this.paymentType = record.paymentType;
    this.paymentMethod = record.paymentMethod;
    this.paymentProofUrl = record.paymentProofUrl ?? null;
    this.transactionRef = record.transactionRef ?? null;
    this.status = record.status;
    this.notes = record.notes ?? null;
    this.confirmedAt = record.confirmedAt ?? null;
    this.rejectionReason = record.rejectionReason ?? null;
    this.isCustomerInitiated = record.isCustomerInitiated ?? false;
    this.createdAt = record.createdAt;
    if (record.spk) {
      this.spk = {
        uuid: record.spk.uuid,
        spkNumber: record.spk.spkNumber,
        customerId: record.spk.customerId,
      };
      if (record.spk.customer) {
        this.customer = {
          uuid: record.spk.customer.uuid,
          name: record.spk.customer.name,
          nik: record.spk.customer.nik,
        };
      }
    }
  }
}
