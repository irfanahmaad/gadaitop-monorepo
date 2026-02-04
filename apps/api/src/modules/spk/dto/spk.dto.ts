import { SpkStatusEnum } from '../../../constants/spk-status';
import { SpkRecordEntity } from '../entities/spk-record.entity';
import { SpkItemDto } from './spk-item.dto';

export class SpkDto {
  uuid: string;
  spkNumber: string;
  internalSpkNumber: string | null;
  customerSpkNumber: string | null;
  customerId: string;
  storeId: string;
  ptId: string;
  principalAmount: string;
  tenor: number;
  interestRate: string;
  adminFee: string;
  totalAmount: string;
  remainingBalance: string;
  dueDate: Date;
  status: SpkStatusEnum;
  confirmedAt: Date | null;
  confirmedByPin: boolean;
  createdAt: Date;
  items?: SpkItemDto[];
  customer?: { uuid: string; name: string; nik: string };
  store?: { uuid: string; shortName: string; branchCode: string };
  pt?: { uuid: string; companyName: string };

  constructor(record: SpkRecordEntity & { items?: any[]; customer?: any; store?: any; pt?: any }) {
    this.uuid = record.uuid;
    this.spkNumber = record.spkNumber;
    this.internalSpkNumber = record.internalSpkNumber ?? null;
    this.customerSpkNumber = record.customerSpkNumber ?? null;
    this.customerId = record.customerId;
    this.storeId = record.storeId;
    this.ptId = record.ptId;
    this.principalAmount = record.principalAmount;
    this.tenor = record.tenor;
    this.interestRate = record.interestRate;
    this.adminFee = record.adminFee;
    this.totalAmount = record.totalAmount;
    this.remainingBalance = record.remainingBalance;
    this.dueDate = record.dueDate;
    this.status = record.status;
    this.confirmedAt = record.confirmedAt ?? null;
    this.confirmedByPin = record.confirmedByPin ?? false;
    this.createdAt = record.createdAt;
    if (record.items?.length) {
      this.items = record.items.map((i) => new SpkItemDto(i));
    }
    if (record.customer) {
      this.customer = {
        uuid: record.customer.uuid,
        name: record.customer.name,
        nik: record.customer.nik,
      };
    }
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
