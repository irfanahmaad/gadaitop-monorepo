import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PawnTermEntity } from './entities/pawn-term.entity';
import { PawnTermService } from './pawn-term.service';
import { PawnTermController } from './pawn-term.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PawnTermEntity])],
  controllers: [PawnTermController],
  providers: [PawnTermService],
  exports: [PawnTermService],
})
export class PawnTermModule {}
