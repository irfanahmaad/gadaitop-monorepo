import { Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { StockOpnameSessionEntity } from './stock-opname-session.entity';

@Entity({ name: 'stock_opname_session_stores' })
export class StockOpnameSessionStoreEntity extends AbstractEntity {
  @ManyToOne(() => StockOpnameSessionEntity, (s) => s.sessionStores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'so_session_id', referencedColumnName: 'uuid' })
  session: Relation<StockOpnameSessionEntity>;

  @ManyToOne('BranchEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id', referencedColumnName: 'uuid' })
  store: Relation<any>;
}
