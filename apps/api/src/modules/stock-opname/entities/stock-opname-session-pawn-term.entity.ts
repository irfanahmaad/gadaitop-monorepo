import { Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { StockOpnameSessionEntity } from './stock-opname-session.entity';

@Entity({ name: 'stock_opname_session_pawn_terms' })
export class StockOpnameSessionPawnTermEntity extends AbstractEntity {
  @ManyToOne(() => StockOpnameSessionEntity, (s) => s.sessionPawnTerms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'so_session_id', referencedColumnName: 'uuid' })
  session: Relation<StockOpnameSessionEntity>;

  @ManyToOne('PawnTermEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pawn_term_id', referencedColumnName: 'uuid' })
  pawnTerm: Relation<any>;
}
