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
  spk?: { spkNumber: string; uuid: string; items?: { itemType?: { typeName: string }; description: string; photoUrl?: string }[] };
  spkItem?: { itemType?: { typeName: string }; description: string; photoUrl?: string };

  constructor(item: AuctionBatchItemEntity & { spkItem?: any }) {
    this.uuid = item.uuid;
    this.auctionBatchId = item.auctionBatchId;
    this.spkItemId = item.spkItemId;
    this.pickupStatus = item.pickupStatus;
    this.failureReason = item.failureReason ?? null;
    this.validationVerdict = item.validationVerdict ?? null;
    this.validationNotes = item.validationNotes ?? null;
    this.validationPhotos = item.validationPhotos ?? null;
    this.validatedAt = item.validatedAt ?? null;
    const spkItem = item.spkItem;
    if (spkItem) {
      this.spkItem = {
        itemType: spkItem.itemType,
        description: spkItem.description,
        photoUrl: spkItem.photoUrl,
      };
      const spk = spkItem.spk;
      if (spk) {
        this.spk = {
          spkNumber: spk.spkNumber,
          uuid: spk.uuid,
          items: spk.items,
        };
      }
    }
  }
}
