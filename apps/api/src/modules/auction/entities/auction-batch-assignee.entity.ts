import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { AuctionAssigneeRoleEnum } from '../../../constants/auction-assignee-role';
import { AuctionBatchEntity } from './auction-batch.entity';

/**
 * Join table: auction batch to assigned users with role (marketing_staff | auction_staff).
 */
@Entity({ name: 'auction_batch_assignees' })
export class AuctionBatchAssigneeEntity extends AbstractEntity {
  @ManyToOne(() => AuctionBatchEntity, (b) => b.batchAssignees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'auction_batch_id', referencedColumnName: 'uuid' })
  batch: Relation<AuctionBatchEntity>;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'uuid' })
  user: Relation<any>;

  @Column({ type: 'enum', enum: AuctionAssigneeRoleEnum })
  role: AuctionAssigneeRoleEnum;
}
