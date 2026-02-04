import { Seeder } from '@concepta/typeorm-seeding';
import { subDays } from 'date-fns';

import { StockOpnameSessionEntity } from '../../modules/stock-opname/entities/stock-opname-session.entity';
import { StockOpnameItemEntity } from '../../modules/stock-opname/entities/stock-opname-item.entity';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { SpkItemEntity } from '../../modules/spk/entities/spk-item.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { StockOpnameSessionStatusEnum } from '../../constants/stock-opname-session-status';
import { SpkItemStatusEnum } from '../../constants/spk-item-status';
import { dataSource } from '../db.seed';
import { StockOpnameSessionFactory } from './stock-opname-session.factory';
import { StockOpnameItemFactory } from './stock-opname-item.factory';

/**
 * Stock Opname Seed
 * 
 * Creates inventory counting sessions per branch.
 * - Completed session (Past)
 * - InProgress session (Current, for demo)
 */
export class StockOpnameSeed extends Seeder {
  async run(): Promise<void> {
    const sessionFactory = this.factory(StockOpnameSessionFactory);
    const itemFactory = this.factory(StockOpnameItemFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const sessionRepo = dataSource.getRepository(StockOpnameSessionEntity);
    const branchRepo = dataSource.getRepository(BranchEntity);
    const spkItemRepo = dataSource.getRepository(SpkItemEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const existingCount = await sessionRepo.count();
    if (existingCount > 0) {
      console.log(`Stock Opname sessions exist (${existingCount}), skipping seed`);
      return;
    }

    const branches = await branchRepo.find();
    
    // Get a designated creator (e.g., admin or system) - just picking first user
    const creator = await userRepo.findOne({ where: {} });
    if (!creator) {
      console.log('⚠️ No users found. Run UserSeed first.');
      return;
    }

    let totalSessions = 0;

    for (const branch of branches) {
      // Find items in storage for this branch
      const storageItems = await spkItemRepo.find({
        where: { 
          status: SpkItemStatusEnum.InStorage, 
          spk: { storeId: branch.uuid } 
        },
        relations: ['spk']
      });

      if (storageItems.length === 0) continue;

      // 1. Create a Completed Session (Past)
      const completedSession = await sessionFactory.create({
        sessionCode: `SO-${branch.branchCode || 'BRCH'}-${Date.now().toString().slice(-4)}-COMP`,
        ptId: branch.companyId,
        storeId: branch.uuid,
        startDate: subDays(new Date(), 30),
        endDate: subDays(new Date(), 29),
        status: StockOpnameSessionStatusEnum.Completed,
        creator,
        totalItemsSystem: storageItems.length,
        totalItemsCounted: storageItems.length, // Perfect score
        variancesCount: 0,
      });
      totalSessions++;

      // Create items for completed session (all match)
      for (const item of storageItems) {
        await itemFactory.create({
          soSessionId: completedSession.uuid,
          spkItemId: item.uuid,
          systemQuantity: 1,
          countedQuantity: 1,
          conditionBefore: item.condition,
          conditionAfter: item.condition,
        });
      }

      // 2. Create an InProgress Session (Current Demo)
      // Only picking a few items to simulate partial progress
      const currentSession = await sessionFactory.create({
        sessionCode: `SO-${branch.branchCode || 'BRCH'}-${Date.now().toString().slice(-4)}-CURR`,
        ptId: branch.companyId,
        storeId: branch.uuid,
        startDate: new Date(),
        status: StockOpnameSessionStatusEnum.InProgress,
        creator,
        totalItemsSystem: storageItems.length,
        totalItemsCounted: Math.floor(storageItems.length / 2),
        variancesCount: 0,
      });
      totalSessions++;

      // Create items for current session - First half counted, second half not
      const halfIndex = Math.floor(storageItems.length / 2);
      for (let i = 0; i < storageItems.length; i++) {
        const item = storageItems[i];
        const isCounted = i < halfIndex;
        
        await itemFactory.create({
          soSessionId: currentSession.uuid,
          spkItemId: item.uuid,
          systemQuantity: 1,
          countedQuantity: isCounted ? 1 : null,
          conditionBefore: item.condition,
          // Simulate 1 missing item in the counted batch for demo fun
          conditionNotes: (isCounted && i === 0) ? 'Item tag faded' : null,
        });
      }
    }

    console.log(`✅ Seeded ${totalSessions} Stock Opname sessions`);
  }
}
