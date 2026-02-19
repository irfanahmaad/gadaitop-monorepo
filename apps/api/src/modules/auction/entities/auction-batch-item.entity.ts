import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { AuctionPickupStatusEnum } from '../../../constants/auction-pickup-status';
import { AuctionValidationVerdictEnum } from '../../../constants/auction-validation-verdict';
import { AuctionBatchEntity } from './auction-batch.entity';

/**
 * Auction batch item (ItemLelang) - one SPK item in a batch; pickup and validation tracking.
 */
@Entity({ name: 'auction_batch_items' })
@Index(['auctionBatchId', 'pickupStatus'])
export class AuctionBatchItemEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  auctionBatchId: string;

  @ManyToOne('AuctionBatchEntity', (b: AuctionBatchEntity) => b.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'auction_batch_id', referencedColumnName: 'uuid' })
  batch: Relation<AuctionBatchEntity>;

  @Column({ type: 'uuid' })
  @Index()
  spkItemId: string;

  @ManyToOne('SpkItemEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spk_item_id', referencedColumnName: 'uuid' })
  spkItem: Relation<any>;

  @Column({ type: 'enum', enum: AuctionPickupStatusEnum, default: AuctionPickupStatusEnum.Pending })
  @Index()
  pickupStatus: AuctionPickupStatusEnum;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ type: 'enum', enum: AuctionValidationVerdictEnum, nullable: true })
  validationVerdict: AuctionValidationVerdictEnum | null;

  @Column({ type: 'text', nullable: true })
  validationNotes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  validationPhotos: string[] | null;

  @Column({ type: 'uuid', nullable: true })
  validatedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'validated_by', referencedColumnName: 'uuid' })
  validator: Relation<any> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  validatedAt: Date | null;
}
