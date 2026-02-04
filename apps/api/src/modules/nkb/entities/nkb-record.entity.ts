import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { NkbPaymentMethodEnum } from '../../../constants/nkb-payment-method';
import { NkbPaymentTypeEnum } from '../../../constants/nkb-payment-type';
import { NkbStatusEnum } from '../../../constants/nkb-status';

/**
 * NKB (Nota Kredit Barang) - Payment/renewal/redemption record.
 * Created by SPK extend/redeem or by staff. Confirmed by store staff.
 */
@Entity({ name: 'nkb_records' })
export class NkbRecordEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  nkbNumber: string;

  @Column({ type: 'uuid' })
  @Index()
  spkId: string;

  @ManyToOne('SpkRecordEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'spk_id', referencedColumnName: 'uuid' })
  spk: Relation<any>;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amountPaid: string;

  @Column({ type: 'enum', enum: NkbPaymentTypeEnum })
  @Index()
  paymentType: NkbPaymentTypeEnum;

  @Column({ type: 'enum', enum: NkbPaymentMethodEnum })
  paymentMethod: NkbPaymentMethodEnum;

  @Column({ type: 'varchar', length: 500, nullable: true })
  paymentProofUrl: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionRef: string | null;

  @Column({ type: 'enum', enum: NkbStatusEnum, default: NkbStatusEnum.Pending })
  @Index()
  status: NkbStatusEnum;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'uuid' })
  creator: Relation<any> | null;

  @Column({ type: 'uuid', nullable: true })
  confirmedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'confirmed_by', referencedColumnName: 'uuid' })
  confirmer: Relation<any> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  confirmedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'boolean', default: false })
  isCustomerInitiated: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentGatewayProvider: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  paymentGatewayOrderId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentGatewayStatus: string | null;

  @Column({ type: 'jsonb', nullable: true })
  paymentGatewayCallbackData: Record<string, unknown> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: Date | null;
}
