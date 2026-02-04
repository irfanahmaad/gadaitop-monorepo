import { Factory } from '@concepta/typeorm-seeding';

import { PawnTermEntity } from '../../modules/pawn-term/entities/pawn-term.entity';

export class PawnTermFactory extends Factory<PawnTermEntity> {
  protected async entity(): Promise<PawnTermEntity> {
    const pawnTerm = new PawnTermEntity();
    return Promise.resolve(pawnTerm);
  }
}
