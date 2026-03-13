import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CashMutationModule } from '../cash-mutation/cash-mutation.module';
import { PawnTermEntity } from '../pawn-term/entities/pawn-term.entity';
import { SpkItemEntity } from '../spk/entities/spk-item.entity';
import { StockOpnameSessionEntity } from './entities/stock-opname-session.entity';
import { StockOpnameSessionStoreEntity } from './entities/stock-opname-session-store.entity';
import { StockOpnameSessionAssigneeEntity } from './entities/stock-opname-session-assignee.entity';
import { StockOpnameSessionPawnTermEntity } from './entities/stock-opname-session-pawn-term.entity';
import { StockOpnameItemEntity } from './entities/stock-opname-item.entity';
import { SoPriorityRuleEntity } from './entities/so-priority-rule.entity';
import { StockOpnameController } from './stock-opname.controller';
import { StockOpnameService } from './stock-opname.service';
import { SoPriorityRulesController } from './so-priority-rules.controller';
import { SoPriorityRuleService } from './so-priority-rule.service';

@Module({
  imports: [
    CashMutationModule,
    TypeOrmModule.forFeature([
      StockOpnameSessionEntity,
      StockOpnameSessionStoreEntity,
      StockOpnameSessionAssigneeEntity,
      StockOpnameSessionPawnTermEntity,
      StockOpnameItemEntity,
      SoPriorityRuleEntity,
      SpkItemEntity,
      PawnTermEntity,
    ]),
  ],
  controllers: [StockOpnameController, SoPriorityRulesController],
  providers: [StockOpnameService, SoPriorityRuleService],
  exports: [StockOpnameService, SoPriorityRuleService],
})
export class StockOpnameModule {}
