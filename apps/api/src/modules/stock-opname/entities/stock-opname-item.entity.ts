import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { SpkItemConditionEnum } from '../../../constants/spk-item-condition';
import { StockOpnameSessionEntity } from './stock-opname-session.entity';

@Entity({ name: 'stock_opname_items' })
export class StockOpnameItemEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  soSessionId: string;

  @ManyToOne('StockOpnameSessionEntity', (s: StockOpnameSessionEntity) => s.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'so_session_id', referencedColumnName: 'uuid' })
  session: Relation<StockOpnameSessionEntity>;

  @Column({ type: 'uuid' })
  @Index()
  spkItemId: string;

  @ManyToOne('SpkItemEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spk_item_id', referencedColumnName: 'uuid' })
  spkItem: Relation<any>;

  @Column({ type: 'int', default: 1 })
  systemQuantity: number;

  @Column({ type: 'int', nullable: true })
  countedQuantity: number | null;

  @Column({ type: 'enum', enum: SpkItemConditionEnum, nullable: true })
  conditionBefore: SpkItemConditionEnum | null;

  @Column({ type: 'enum', enum: SpkItemConditionEnum, nullable: true })
  conditionAfter: SpkItemConditionEnum | null;

  @Column({ type: 'text', nullable: true })
  conditionNotes: string | null;

  @Column({ type: 'jsonb', nullable: true })
  damagePhotos: string[] | null;

  @Column({ type: 'uuid', nullable: true })
  countedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'counted_by', referencedColumnName: 'uuid' })
  counter: Relation<any> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  countedAt: Date | null;
}
