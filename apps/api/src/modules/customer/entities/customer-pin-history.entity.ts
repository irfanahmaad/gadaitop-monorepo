import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';

/**
 * Audit trail for customer PIN changes (RS 8.3.b).
 */
@Entity({ name: 'customer_pin_history' })
export class CustomerPinHistoryEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  customerId: string;

  @ManyToOne('CustomerEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'uuid' })
  customer: Relation<any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  oldPinHash: string | null;

  @Column({ type: 'varchar', length: 255 })
  newPinHash: string;

  @Column({ type: 'uuid', nullable: true })
  changedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by', referencedColumnName: 'uuid' })
  changer: Relation<any> | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  changeReason: string | null;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;
}
