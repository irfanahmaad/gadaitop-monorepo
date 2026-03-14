import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { AuctionBatchStatusEnum } from '../../../constants/auction-batch-status';
import { AuctionBatchAssigneeEntity } from './auction-batch-assignee.entity';
import { AuctionBatchItemEntity } from './auction-batch-item.entity';

/**
 * Auction batch (BatchLelang) - per-store batch of overdue SPK items for pickup and validation.
 */
@Entity({ name: 'auction_batches' })
@Index(['ptId', 'storeId', 'status'])
export class AuctionBatchEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  batchCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ type: 'uuid' })
  @Index()
  storeId: string;

  @ManyToOne('BranchEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id', referencedColumnName: 'uuid' })
  store: Relation<any>;

  @Column({ type: 'uuid' })
  @Index()
  ptId: string;

  @ManyToOne('CompanyEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pt_id', referencedColumnName: 'uuid' })
  pt: Relation<any>;

  @Column({ type: 'enum', enum: AuctionBatchStatusEnum, default: AuctionBatchStatusEnum.Draft })
  @Index()
  status: AuctionBatchStatusEnum;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /** Marketing-only notes (e.g. campaign plan, target channel); editable by Marketing role. */
  @Column({ name: 'marketing_notes', type: 'text', nullable: true })
  marketingNotes: string | null;

  /** Marketing-only asset URLs (e.g. banners, copy); editable by Marketing role. */
  @Column({ name: 'marketing_assets', type: 'jsonb', nullable: true })
  marketingAssets: string[] | null;

  @OneToMany(() => AuctionBatchAssigneeEntity, (a) => a.batch)
  batchAssignees: Relation<AuctionBatchAssigneeEntity[]>;

  @OneToMany('AuctionBatchItemEntity', 'batch')
  items: Relation<AuctionBatchItemEntity[]>;
}
