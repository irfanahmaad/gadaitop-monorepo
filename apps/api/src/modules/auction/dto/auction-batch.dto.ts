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
  items?: AuctionBatchItemDto[];

  constructor(batch: AuctionBatchEntity & { items?: any[] }) {
    this.uuid = batch.uuid;
    this.batchCode = batch.batchCode;
    this.storeId = batch.storeId;
    this.ptId = batch.ptId;
    this.status = batch.status;
    this.assignedTo = batch.assignedTo ?? null;
    this.assignedAt = batch.assignedAt ?? null;
    this.notes = batch.notes ?? null;
    this.createdAt = batch.createdAt;
    if (batch.items?.length) {
      this.items = batch.items.map((i) => new AuctionBatchItemDto(i));
    }
  }
}
