import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { StockOpnameSessionStatusEnum } from '../../../constants/stock-opname-session-status';
import { StockOpnameItemEntity } from './stock-opname-item.entity';

@Entity({ name: 'stock_opname_sessions' })
export class StockOpnameSessionEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  sessionCode: string;

  @Column({ type: 'uuid' })
  @Index()
  ptId: string;

  @ManyToOne('CompanyEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pt_id', referencedColumnName: 'uuid' })
  pt: Relation<any>;

  @Column({ type: 'uuid' })
  @Index()
  storeId: string;

  @ManyToOne('BranchEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id', referencedColumnName: 'uuid' })
  store: Relation<any>;

  @Column({ type: 'date' })
  @Index()
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'enum', enum: StockOpnameSessionStatusEnum, default: StockOpnameSessionStatusEnum.Draft })
  @Index()
  status: StockOpnameSessionStatusEnum;

  @Column({ type: 'int', default: 0 })
  totalItemsSystem: number;

  @Column({ type: 'int', default: 0 })
  totalItemsCounted: number;

  @Column({ type: 'int', default: 0 })
  variancesCount: number;

  @ManyToOne('UserEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'uuid' })
  creator: Relation<any>;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by', referencedColumnName: 'uuid' })
  approver: Relation<any> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany('StockOpnameItemEntity', 'session')
  items: Relation<StockOpnameItemEntity[]>;
}
