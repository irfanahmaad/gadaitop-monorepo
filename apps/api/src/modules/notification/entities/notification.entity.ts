import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';

/**
 * In-app notification for a user (recipient).
 */
@Entity({ name: 'notifications' })
@Index(['recipientId', 'readAt'])
@Index(['recipientId', 'createdAt'])
export class NotificationEntity extends AbstractEntity {
  @Column({ type: 'uuid', nullable: true })
  @Index()
  ptId: string | null;

  @ManyToOne('CompanyEntity', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pt_id', referencedColumnName: 'uuid' })
  pt: Relation<any> | null;

  @Column({ type: 'uuid' })
  @Index()
  recipientId: string;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id', referencedColumnName: 'uuid' })
  recipient: Relation<any>;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 50, default: 'info' })
  @Index()
  type: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  readAt: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  relatedEntityType: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  relatedEntityId: string | null;
}
