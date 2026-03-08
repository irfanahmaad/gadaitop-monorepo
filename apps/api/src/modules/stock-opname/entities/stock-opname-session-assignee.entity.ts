import { Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { StockOpnameSessionEntity } from './stock-opname-session.entity';

@Entity({ name: 'stock_opname_session_assignees' })
export class StockOpnameSessionAssigneeEntity extends AbstractEntity {
  @ManyToOne(() => StockOpnameSessionEntity, (s) => s.sessionAssignees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'so_session_id', referencedColumnName: 'uuid' })
  session: Relation<StockOpnameSessionEntity>;

  @ManyToOne('UserEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'uuid' })
  user: Relation<any>;
}
