import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { CapitalTopupStatusEnum } from '../../../constants/capital-topup-status';

/**
 * Capital top-up (Tambah Modal) - Store requests additional capital from PT.
 */
@Entity({ name: 'capital_topups' })
@Index(['ptId', 'storeId', 'status'])
export class CapitalTopupEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  topupCode: string;

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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: CapitalTopupStatusEnum, default: CapitalTopupStatusEnum.Pending })
  @Index()
  status: CapitalTopupStatusEnum;

  @Column({ type: 'uuid' })
  requestedBy: string;

  @ManyToOne('UserEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requested_by', referencedColumnName: 'uuid' })
  requester: Relation<any>;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'uuid' })
  approver: Relation<any> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  disbursedAt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  disbursementProofUrl: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;
}
