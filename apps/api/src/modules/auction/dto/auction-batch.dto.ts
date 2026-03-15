import { AuctionBatchStatusEnum } from '../../../constants/auction-batch-status';
import { AuctionAssigneeRoleEnum } from '../../../constants/auction-assignee-role';
import { AuctionBatchEntity } from '../entities/auction-batch.entity';
import { AuctionBatchItemDto } from './auction-batch-item.dto';

export type AssigneeSummary = {
  uuid: string;
  fullName?: string;
  name?: string;
  email?: string;
};

type BatchWithAssignees = AuctionBatchEntity & {
  items?: any[];
  store?: any;
  batchAssignees?: Array<{
    role: AuctionAssigneeRoleEnum;
    user?: { uuid: string; fullName?: string; name?: string; email?: string };
  }>;
};

export class AuctionBatchDto {
  uuid: string;
  batchCode: string;
  name: string | null;
  storeId: string;
  ptId: string;
  status: AuctionBatchStatusEnum;
  scheduledDate: Date | null;
  notes: string | null;
  marketingNotes: string | null;
  marketingAssets: string[] | null;
  createdAt: Date;
  store?: { shortName: string };
  marketingStaff: AssigneeSummary[];
  auctionStaff: AssigneeSummary[];
  items?: AuctionBatchItemDto[];

  constructor(batch: BatchWithAssignees) {
    this.uuid = batch.uuid;
    this.batchCode = batch.batchCode;
    this.name = batch.name ?? null;
    this.storeId = batch.storeId;
    this.ptId = batch.ptId;
    this.status = batch.status;
    this.scheduledDate = batch.scheduledDate ?? null;
    this.notes = batch.notes ?? null;
    this.marketingNotes = batch.marketingNotes ?? null;
    this.marketingAssets = batch.marketingAssets ?? null;
    this.createdAt = batch.createdAt;
    this.store = batch.store;
    this.marketingStaff = (batch.batchAssignees ?? [])
      .filter((a) => a.role === AuctionAssigneeRoleEnum.MarketingStaff)
      .map((a) => {
        const u = a.user;
        return {
          uuid: u?.uuid ?? '',
          fullName: u?.fullName ?? u?.name,
          name: u?.name ?? u?.fullName,
          email: u?.email,
        };
      });
    this.auctionStaff = (batch.batchAssignees ?? [])
      .filter((a) => a.role === AuctionAssigneeRoleEnum.AuctionStaff)
      .map((a) => {
        const u = a.user;
        return {
          uuid: u?.uuid ?? '',
          fullName: u?.fullName ?? u?.name,
          name: u?.name ?? u?.fullName,
          email: u?.email,
        };
      });
    if (batch.items?.length) {
      this.items = batch.items.map((i) => new AuctionBatchItemDto(i));
    }
  }
}
