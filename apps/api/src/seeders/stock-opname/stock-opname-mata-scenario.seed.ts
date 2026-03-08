import { Seeder } from '@concepta/typeorm-seeding';
import { addDays } from 'date-fns';

import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { CatalogEntity } from '../../modules/catalog/entities/catalog.entity';
import { CustomerEntity } from '../../modules/customer/entities/customer.entity';
import { PawnTermEntity } from '../../modules/pawn-term/entities/pawn-term.entity';
import { SpkItemEntity } from '../../modules/spk/entities/spk-item.entity';
import { StockOpnameSessionEntity } from '../../modules/stock-opname/entities/stock-opname-session.entity';
import { StockOpnameSessionStoreEntity } from '../../modules/stock-opname/entities/stock-opname-session-store.entity';
import { StockOpnameSessionAssigneeEntity } from '../../modules/stock-opname/entities/stock-opname-session-assignee.entity';
import { StockOpnameSessionPawnTermEntity } from '../../modules/stock-opname/entities/stock-opname-session-pawn-term.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { SpkStatusEnum } from '../../constants/spk-status';
import { SpkItemConditionEnum } from '../../constants/spk-item-condition';
import { SpkItemStatusEnum } from '../../constants/spk-item-status';
import { StockOpnameSessionStatusEnum } from '../../constants/stock-opname-session-status';
import { dataSource } from '../db.seed';
import { SpkRecordFactory } from '../spk/spk-record.factory';
import { SpkItemFactory } from '../spk/spk-item.factory';
import { StockOpnameSessionFactory } from './stock-opname-session.factory';
import { StockOpnameItemFactory } from './stock-opname-item.factory';

/**
 * Stock Opname Mata Scenario Seed
 *
 * Creates a deterministic scenario for reproduction:
 * - 10 Active SPKs with one item each (all in_storage, matching pawn term)
 * - 1 Stock Opname session with mataItemCount: 10 and 10 stock_opname_items (all uncounted)
 * All items appear in "Belum Terscan" and can be scanned and moved to "Terscan".
 */
export class StockOpnameMataScenarioSeed extends Seeder {
  async run(): Promise<void> {
    const spkFactory = this.factory(SpkRecordFactory);
    const itemFactory = this.factory(SpkItemFactory);
    const sessionFactory = this.factory(StockOpnameSessionFactory);
    const soItemFactory = this.factory(StockOpnameItemFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const branchRepo = dataSource.getRepository(BranchEntity);
    const catalogRepo = dataSource.getRepository(CatalogEntity);
    const customerRepo = dataSource.getRepository(CustomerEntity);
    const pawnTermRepo = dataSource.getRepository(PawnTermEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const sessionStoreRepo = dataSource.getRepository(StockOpnameSessionStoreEntity);
    const sessionAssigneeRepo = dataSource.getRepository(StockOpnameSessionAssigneeEntity);
    const sessionPawnTermRepo = dataSource.getRepository(StockOpnameSessionPawnTermEntity);

    const existingMataSession = await dataSource.getRepository(StockOpnameSessionEntity).findOne({
      where: { sessionCode: 'SO-MATA10-DEMO' },
    });
    if (existingMataSession) {
      console.log('Stock Opname Mata scenario already exists, skipping');
      return;
    }

    const branch = await branchRepo.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });
    if (!branch) {
      console.log('⚠️ No branch found for Mata scenario');
      return;
    }

    const ptId = branch.companyId;
    const pawnTerm = await pawnTermRepo.findOne({
      where: { ptId },
      relations: ['itemType'],
    });
    if (!pawnTerm) {
      console.log('⚠️ No pawn term found for Mata scenario');
      return;
    }

    const catalog = await catalogRepo.findOne({
      where: { ptId, itemTypeId: pawnTerm.itemTypeId },
      relations: ['itemType'],
    });
    if (!catalog) {
      console.log('⚠️ No catalog found for Mata scenario');
      return;
    }

    const customer = await customerRepo.findOne({ where: { ptId } });
    if (!customer) {
      console.log('⚠️ No customer found for Mata scenario');
      return;
    }

    const creator = await userRepo.findOne({ where: {} });
    if (!creator) {
      console.log('⚠️ No user found for Mata scenario');
      return;
    }

    const principal = catalog.pawnValueMin;
    const interest = (parseFloat(principal) * parseFloat(pawnTerm.interestRate) / 100).toString();
    const total = (parseFloat(principal) + parseFloat(interest) + parseFloat(pawnTerm.adminFee)).toString();

    const createdDate = addDays(new Date(), -5);
    const dueDate = addDays(createdDate, pawnTerm.tenorMax);

    const spkItems: SpkItemEntity[] = [];

    for (let i = 1; i <= 10; i++) {
      const spkNumber = `SPK-MATA10-${i.toString().padStart(3, '0')}`;
      const randId = 1000 + i;
      const custSpkNumber = `C-MATA10-${randId}`;
      const internalSpkNumber = `I-MATA10-${randId}`;

      const spk = await spkFactory.create({
        spkNumber,
        internalSpkNumber,
        customerSpkNumber: custSpkNumber,
        customerId: customer.uuid,
        storeId: branch.uuid,
        ptId,
        principalAmount: principal,
        tenor: pawnTerm.tenorMax,
        interestRate: pawnTerm.interestRate,
        adminFee: pawnTerm.adminFee,
        totalAmount: total,
        remainingBalance: total,
        dueDate,
        status: SpkStatusEnum.Active,
        confirmedAt: createdDate,
        confirmedByPin: true,
        createdAt: createdDate,
        updatedAt: createdDate,
      });

      const spkItem = await itemFactory.create({
        spkId: spk.uuid,
        catalogId: catalog.uuid,
        itemTypeId: catalog.itemTypeId,
        description: `${catalog.name} - Mata scenario #${i}`,
        brand: catalog.name.split(' ')[0],
        model: catalog.name,
        appraisedValue: principal,
        condition: SpkItemConditionEnum.Good,
        storageLocation: `LOC-MATA10-${i}`,
        qrCode: `QR-${spkNumber}`,
        status: SpkItemStatusEnum.InStorage,
      });
      spkItems.push(spkItem);
    }

    const session = await sessionFactory.create({
      sessionCode: 'SO-MATA10-DEMO',
      ptId,
      startDate: new Date(),
      status: StockOpnameSessionStatusEnum.InProgress,
      creator,
      mataItemCount: 10,
      totalItemsSystem: 10,
      totalItemsCounted: 0,
      variancesCount: 0,
    });

    await sessionStoreRepo.save(
      sessionStoreRepo.create({
        session,
        store: { uuid: branch.uuid },
      }),
    );
    await sessionAssigneeRepo.save(
      sessionAssigneeRepo.create({
        session,
        user: { uuid: creator.uuid },
      }),
    );
    await sessionPawnTermRepo.save(
      sessionPawnTermRepo.create({
        session,
        pawnTerm: { uuid: pawnTerm.uuid },
      }),
    );

    for (const spkItem of spkItems) {
      await soItemFactory.create({
        soSessionId: session.uuid,
        spkItemId: spkItem.uuid,
        systemQuantity: 1,
        countedQuantity: null,
        conditionBefore: spkItem.condition,
      });
    }

    console.log('✅ Stock Opname Mata scenario: 10 SPKs + 1 SO session (SO-MATA10-DEMO) with 10 items in Belum Terscan');
  }
}
