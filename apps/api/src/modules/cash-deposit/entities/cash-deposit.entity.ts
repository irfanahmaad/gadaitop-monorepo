import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { CashDepositPaymentMethodEnum } from '../../../constants/cash-deposit-payment-method';
import { CashDepositStatusEnum } from '../../../constants/cash-deposit-status';

/**
 * Cash deposit (Setor Uang) - Store deposits cash to PT.
 * Creates deposit request with VA/QR; approved by Admin PT.
 */
@Entity({ name: 'cash_deposits' })
@Index(['ptId', 'storeId', 'status'])
export class CashDepositEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  depositCode: string;

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

  @Column({ type: 'enum', enum: CashDepositPaymentMethodEnum })
  paymentMethod: CashDepositPaymentMethodEnum;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentChannel: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  qrCodeUrl: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  virtualAccount: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  paymentProofUrl: string | null;

  @Column({ type: 'enum', enum: CashDepositStatusEnum, default: CashDepositStatusEnum.Pending })
  @Index()
  status: CashDepositStatusEnum;

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

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;
}
