import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';

/**
 * Historical pricing records for catalogs (RS 8.2.a).
 */
@Entity({ name: 'catalog_price_history' })
@Index(['catalogId', 'effectiveUntil'])
export class CatalogPriceHistoryEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  catalogId: string;

  @ManyToOne('CatalogEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'catalog_id', referencedColumnName: 'uuid' })
  catalog: Relation<any>;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basePrice: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pawnValueMin: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pawnValueMax: string;

  @Column({ type: 'date' })
  @Index()
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  @Index()
  effectiveUntil: Date | null;

  @Column({ type: 'text', nullable: true })
  changeReason: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'uuid' })
  creator: Relation<any> | null;
}
