import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { CashMutationCategoryEnum } from '../../../constants/cash-mutation-category';
import { CashMutationTypeEnum } from '../../../constants/cash-mutation-type';

/**
 * Cash mutation (Mutasi) - Cash flow tracking per store.
 * Created automatically by SPK/NKB/deposit/topup or manually (adjustment/expense).
 */
@Entity({ name: 'cash_mutations' })
export class CashMutationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid' })
  @Index()
  storeId: string;

  @ManyToOne('BranchEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id', referencedColumnName: 'uuid' })
  store: Relation<any>;

  @Column({ type: 'date' })
  @Index()
  mutationDate: Date;

  @Column({ type: 'enum', enum: CashMutationTypeEnum })
  @Index()
  mutationType: CashMutationTypeEnum;

  @Column({ type: 'enum', enum: CashMutationCategoryEnum })
  @Index()
  category: CashMutationCategoryEnum;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balanceBefore: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceType: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  referenceId: string | null;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne('UserEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'uuid' })
  creator: Relation<any>;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
