import { AuctionPickupStatusEnum } from '../../../constants/auction-pickup-status';
import { AuctionValidationVerdictEnum } from '../../../constants/auction-validation-verdict';
import { AuctionBatchItemEntity } from '../entities/auction-batch-item.entity';

export class AuctionBatchItemDto {
  uuid: string;
  auctionBatchId: string;
  spkItemId: string;
  pickupStatus: AuctionPickupStatusEnum;
  failureReason: string | null;
  validationVerdict: AuctionValidationVerdictEnum | null;
  validationNotes: string | null;
  validationPhotos: string[] | null;
  validatedAt: Date | null;

  constructor(item: AuctionBatchItemEntity) {
    this.uuid = item.uuid;
    this.auctionBatchId = item.auctionBatchId;
    this.spkItemId = item.spkItemId;
    this.pickupStatus = item.pickupStatus;
    this.failureReason = item.failureReason ?? null;
    this.validationVerdict = item.validationVerdict ?? null;
    this.validationNotes = item.validationNotes ?? null;
    this.validationPhotos = item.validationPhotos ?? null;
    this.validatedAt = item.validatedAt ?? null;
  }
}
