import { SpkItemConditionEnum } from '../../../constants/spk-item-condition';
import { StockOpnameItemEntity } from '../entities/stock-opname-item.entity';

export interface StockOpnameItemSpkItemDto {
  uuid: string;
  spkId: string;
  description: string;
  itemTypeId: string;
  appraisedValue: string | null;
  evidencePhotos: string[] | null;
  qrCode: string | null;
  status: string;
  itemType?: { uuid: string; typeName: string } | null;
  spk?: { uuid: string; spkNumber: string } | null;
}

export class StockOpnameItemDto {
  uuid: string;
  soSessionId: string;
  spkItemId: string;
  systemQuantity: number;
  countedQuantity: number | null;
  variance: number;
  conditionBefore: SpkItemConditionEnum | null;
  conditionAfter: SpkItemConditionEnum | null;
  conditionNotes: string | null;
  damagePhotos: string[] | null;
  countedAt: Date | null;
  spkItem?: StockOpnameItemSpkItemDto | null;

  constructor(item: StockOpnameItemEntity) {
    this.uuid = item.uuid;
    this.soSessionId = item.soSessionId;
    this.spkItemId = item.spkItemId;
    this.systemQuantity = item.systemQuantity ?? 1;
    this.countedQuantity = item.countedQuantity ?? null;
    this.variance =
      item.countedQuantity != null
        ? item.countedQuantity - (item.systemQuantity ?? 1)
        : 0;
    this.conditionBefore = item.conditionBefore ?? null;
    this.conditionAfter = item.conditionAfter ?? null;
    this.conditionNotes = item.conditionNotes ?? null;
    this.damagePhotos = item.damagePhotos ?? null;
    this.countedAt = item.countedAt ?? null;

    // Map spkItem relation if loaded
    if (item.spkItem) {
      const si = item.spkItem as any;
      this.spkItem = {
        uuid: si.uuid,
        spkId: si.spkId,
        description: si.description ?? '',
        itemTypeId: si.itemTypeId ?? '',
        appraisedValue: si.appraisedValue ?? null,
        evidencePhotos: si.evidencePhotos ?? null,
        qrCode: si.qrCode ?? null,
        status: si.status ?? '',
        itemType: si.itemType ? { uuid: si.itemType.uuid, typeName: si.itemType.typeName } : null,
        spk: si.spk ? { uuid: si.spk.uuid, spkNumber: si.spk.spkNumber ?? si.spk.spk_number ?? '' } : null,
      };
    } else {
      this.spkItem = null;
    }
  }
}
