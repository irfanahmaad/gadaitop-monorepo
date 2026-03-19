import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { CashDepositStatusEnum } from '../../../constants/cash-deposit-status';

/**
 * Cash deposit (Setor Uang) - Store sends cash to PT via Xendit Virtual Account.
 * Created by Admin PT; paid by Staff Toko via VA; confirmed automatically via webhook.
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

  /** Xendit Fixed VA account number shown to the payer */
  @Column({ type: 'varchar', length: 50, nullable: true })
  virtualAccount: string | null;

  /** Xendit VA ID (id returned by Xendit when creating the VA) */
  @Column({ type: 'varchar', length: 100, nullable: true })
  xenditExternalId: string | null;

  @Column({ type: 'enum', enum: CashDepositStatusEnum, default: CashDepositStatusEnum.Pending })
  @Index()
  status: CashDepositStatusEnum;

  /** End-of-day expiry for the VA (set to 23:59:59 of creation date) */
  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date | null;

  /** User who created the request (Admin PT) */
  @Column({ type: 'uuid' })
  requestedBy: string;

  @ManyToOne('UserEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requested_by', referencedColumnName: 'uuid' })
  requester: Relation<any>;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
