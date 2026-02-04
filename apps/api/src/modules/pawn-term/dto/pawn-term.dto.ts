import { PawnTermEntity } from '../entities/pawn-term.entity';

export class PawnTermDto extends PawnTermEntity {
  constructor(pawnTerm: PawnTermEntity) {
    super();
    Object.assign(this, pawnTerm);
  }
}
