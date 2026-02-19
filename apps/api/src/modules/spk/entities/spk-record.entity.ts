import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { SpkStatusEnum } from '../../../constants/spk-status';
import { SpkItemEntity } from './spk-item.entity';

/**
 * SPK (Surat Perjanjian Kredit) - Pawn contract record.
 * Internal SPK number: [TypeCode][8-digit sequence per branch].
 * Customer SPK number: YYYYMMDD[4 random digits].
 */
@Entity({ name: 'spk_records' })
@Index(['ptId', 'status'])
@Index(['ptId', 'storeId', 'status'])
@Index(['ptId', 'createdAt'])
@Index(['status', 'dueDate'])
@Index(['customerId', 'status'])
@Index(['storeId', 'status'])
export class SpkRecordEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  spkNumber: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  @Index()
  internalSpkNumber: string | null;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  @Index()
  customerSpkNumber: string | null;

  @Column({ type: 'uuid' })
  @Index()
  customerId: string;

  @ManyToOne('CustomerEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'uuid' })
  customer: Relation<any>;

  @Column({ type: 'uuid' })
  @Index()
  storeId: string;

  @ManyToOne('BranchEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'store_id', referencedColumnName: 'uuid' })
  store: Relation<any>;

  @Column({ type: 'uuid' })
  @Index()
  ptId: string;

  @ManyToOne('CompanyEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pt_id', referencedColumnName: 'uuid' })
  pt: Relation<any>;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  principalAmount: string;

  @Column({ type: 'int' })
  tenor: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  adminFee: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remainingBalance: string;

  @Column({ type: 'date' })
  @Index()
  dueDate: Date;

  @Column({ type: 'enum', enum: SpkStatusEnum, default: SpkStatusEnum.Draft })
  @Index()
  status: SpkStatusEnum;

  @Column({ type: 'timestamp with time zone', nullable: true })
  confirmedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  confirmedByPin: boolean;

  @OneToMany('SpkItemEntity', 'spk')
  items: Relation<SpkItemEntity[]>;
}
