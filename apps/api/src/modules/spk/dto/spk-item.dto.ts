import { SpkItemConditionEnum } from '../../../constants/spk-item-condition';
import { SpkItemStatusEnum } from '../../../constants/spk-item-status';
import { SpkItemEntity } from '../entities/spk-item.entity';

export class SpkItemDto {
  uuid: string;
  spkId: string;
  catalogId: string | null;
  itemTypeId: string;
  description: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  appraisedValue: string;
  condition: SpkItemConditionEnum;
  weight: string | null;
  purity: string | null;
  evidencePhotos: string[] | null;
  storageLocation: string | null;
  qrCode: string | null;
  status: SpkItemStatusEnum;

  constructor(item: SpkItemEntity) {
    this.uuid = item.uuid;
    this.spkId = item.spkId;
    this.catalogId = item.catalogId ?? null;
    this.itemTypeId = item.itemTypeId;
    this.description = item.description;
    this.brand = item.brand ?? null;
    this.model = item.model ?? null;
    this.serialNumber = item.serialNumber ?? null;
    this.appraisedValue = item.appraisedValue;
    this.condition = item.condition;
    this.weight = item.weight ?? null;
    this.purity = item.purity ?? null;
    this.evidencePhotos = item.evidencePhotos ?? null;
    this.storageLocation = item.storageLocation ?? null;
    this.qrCode = item.qrCode ?? null;
    this.status = item.status;
  }
}
