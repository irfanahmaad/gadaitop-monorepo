import { AuctionBatchStatusEnum } from '../../../constants/auction-batch-status';
import { AuctionBatchEntity } from '../entities/auction-batch.entity';
import { AuctionBatchItemDto } from './auction-batch-item.dto';

export class AuctionBatchDto {
  uuid: string;
  batchCode: string;
  storeId: string;
  ptId: string;
  status: AuctionBatchStatusEnum;
  assignedTo: string | null;
  assignedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  store?: { shortName: string };
  assignee?: { fullName?: string; name?: string };
  items?: AuctionBatchItemDto[];

  constructor(batch: AuctionBatchEntity & { items?: any[]; store?: any; assignee?: any }) {
    this.uuid = batch.uuid;
    this.batchCode = batch.batchCode;
    this.storeId = batch.storeId;
    this.ptId = batch.ptId;
    this.status = batch.status;
    this.assignedTo = batch.assignedTo ?? null;
    this.assignedAt = batch.assignedAt ?? null;
    this.notes = batch.notes ?? null;
    this.createdAt = batch.createdAt;
    this.store = batch.store;
    this.assignee = batch.assignee;
    if (batch.items?.length) {
      this.items = batch.items.map((i) => new AuctionBatchItemDto(i));
    }
  }
}
