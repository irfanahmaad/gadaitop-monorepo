import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { SpkItemConditionEnum } from '../../../constants/spk-item-condition';
import { SpkItemStatusEnum } from '../../../constants/spk-item-status';
import { SpkRecordEntity } from './spk-record.entity';

/**
 * Item pledged in an SPK (pawn contract).
 */
@Entity({ name: 'spk_items' })
export class SpkItemEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  spkId: string;

  @ManyToOne('SpkRecordEntity', (spk: SpkRecordEntity) => spk.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'spk_id', referencedColumnName: 'uuid' })
  spk: Relation<SpkRecordEntity>;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  catalogId: string | null;

  @ManyToOne('CatalogEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'catalog_id', referencedColumnName: 'uuid' })
  catalog: Relation<any> | null;

  @Column({ type: 'uuid' })
  @Index()
  itemTypeId: string;

  @ManyToOne('ItemTypeEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_type_id', referencedColumnName: 'uuid' })
  itemType: Relation<any>;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  appraisedValue: string;

  @Column({ type: 'enum', enum: SpkItemConditionEnum, default: SpkItemConditionEnum.Good })
  @Index()
  condition: SpkItemConditionEnum;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  weight: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  purity: string | null;

  @Column({ type: 'jsonb', nullable: true })
  evidencePhotos: string[] | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  storageLocation: string | null;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  @Index()
  qrCode: string | null;

  @Column({ type: 'enum', enum: SpkItemStatusEnum, default: SpkItemStatusEnum.InStorage })
  @Index()
  status: SpkItemStatusEnum;
}
