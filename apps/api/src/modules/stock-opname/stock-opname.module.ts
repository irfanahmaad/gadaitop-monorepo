import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StockOpnameSessionEntity } from './entities/stock-opname-session.entity';
import { StockOpnameItemEntity } from './entities/stock-opname-item.entity';
import { SoPriorityRuleEntity } from './entities/so-priority-rule.entity';
import { StockOpnameController } from './stock-opname.controller';
import { StockOpnameService } from './stock-opname.service';
import { SoPriorityRulesController } from './so-priority-rules.controller';
import { SoPriorityRuleService } from './so-priority-rule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockOpnameSessionEntity,
      StockOpnameItemEntity,
      SoPriorityRuleEntity,
    ]),
  ],
  controllers: [StockOpnameController, SoPriorityRulesController],
  providers: [StockOpnameService, SoPriorityRuleService],
  exports: [StockOpnameService, SoPriorityRuleService],
})
export class StockOpnameModule {}
