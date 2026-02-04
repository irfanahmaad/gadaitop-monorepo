import { SpkItemConditionEnum } from '../../../constants/spk-item-condition';
import { StockOpnameItemEntity } from '../entities/stock-opname-item.entity';

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
  }
}
