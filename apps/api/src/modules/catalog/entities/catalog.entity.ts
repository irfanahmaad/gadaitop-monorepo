import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Relation, Unique } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';

/**
 * Catalog/product master data (PT-specific).
 * Current price stored here; historical prices in catalog_price_history (RS 8.2.a).
 */
@Entity({ name: 'catalogs' })
@Unique(['ptId', 'code'])
@Index(['ptId', 'itemTypeId'])
export class CatalogEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'uuid' })
  @Index()
  ptId: string;

  @ManyToOne('CompanyEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pt_id', referencedColumnName: 'uuid' })
  pt: Relation<any>;

  @Column({ type: 'uuid' })
  @Index()
  itemTypeId: string;

  @ManyToOne('ItemTypeEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_type_id', referencedColumnName: 'uuid' })
  itemType: Relation<any>;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basePrice: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pawnValueMin: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pawnValueMax: string;

  @Column({ type: 'jsonb', nullable: true })
  tenorOptions: number[] | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany('CatalogPriceHistoryEntity', 'catalog')
  priceHistory: Relation<any[]>;
}
