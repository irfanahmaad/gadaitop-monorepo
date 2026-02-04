import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { AuctionBatchStatusEnum } from '../../../constants/auction-batch-status';
import { AuctionBatchItemEntity } from './auction-batch-item.entity';

/**
 * Auction batch (BatchLelang) - per-store batch of overdue SPK items for pickup and validation.
 */
@Entity({ name: 'auction_batches' })
export class AuctionBatchEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  batchCode: string;

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

  @Column({ type: 'uuid', nullable: true })
  assignedTo: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to', referencedColumnName: 'uuid' })
  assignee: Relation<any> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  assignedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany('AuctionBatchItemEntity', 'batch')
  items: Relation<AuctionBatchItemEntity[]>;
}
