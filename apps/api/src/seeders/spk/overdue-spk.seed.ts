import { Seeder } from '@concepta/typeorm-seeding';
import { addDays } from 'date-fns';

import { SpkRecordEntity } from '../../modules/spk/entities/spk-record.entity';
import { SpkItemEntity } from '../../modules/spk/entities/spk-item.entity';
import { CustomerEntity } from '../../modules/customer/entities/customer.entity';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { CatalogEntity } from '../../modules/catalog/entities/catalog.entity';
import { PawnTermEntity } from '../../modules/pawn-term/entities/pawn-term.entity';
import { SpkStatusEnum } from '../../constants/spk-status';
import { SpkItemConditionEnum } from '../../constants/spk-item-condition';
import { SpkItemStatusEnum } from '../../constants/spk-item-status';
import { dataSource } from '../db.seed';
import { SpkRecordFactory } from './spk-record.factory';
import { SpkItemFactory } from './spk-item.factory';

/** Target minimum overdue SPKs per PT so Lelangan > SPK Jatuh Tempo shows rows. */
const TARGET_OVERDUE_PER_PT = 4;

/**
 * Overdue SPK Seed (Supplemental)
 *
 * Ensures each PT has overdue SPKs with in_storage items so Admin PT
 * (e.g. admin.pt001@test.com) can see data on Lelangan > SPK Jatuh Tempo.
 * Runs after SpkSeed; only adds overdue SPKs when a company has fewer than TARGET_OVERDUE_PER_PT.
 */
export class OverdueSpkSeed extends Seeder {
  async run(): Promise<void> {
    const spkFactory = this.factory(SpkRecordFactory);
    const itemFactory = this.factory(SpkItemFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const spkRepo = dataSource.getRepository(SpkRecordEntity);
    const branchRepo = dataSource.getRepository(BranchEntity);
    const companyRepo = dataSource.getRepository(CompanyEntity);
    const customerRepo = dataSource.getRepository(CustomerEntity);
    const catalogRepo = dataSource.getRepository(CatalogEntity);
    const pawnTermRepo = dataSource.getRepository(PawnTermEntity);

    const companies = await companyRepo.find();
    if (companies.length === 0) {
      console.log('OverdueSpkSeed: No companies found');
      return;
    }

    const branches = await branchRepo.find({ relations: ['company'] });
    const branchByPtId = new Map<string, BranchEntity[]>();
    for (const b of branches) {
      const list = branchByPtId.get(b.companyId) || [];
      list.push(b);
      branchByPtId.set(b.companyId, list);
    }

    const customers = await customerRepo.find();
    const customerByPtId = new Map<string, CustomerEntity[]>();
    for (const c of customers) {
      const list = customerByPtId.get(c.ptId) || [];
      list.push(c);
      customerByPtId.set(c.ptId, list);
    }

    const catalogs = await catalogRepo.find({ relations: ['itemType'] });
    const catalogByPtId = new Map<string, CatalogEntity[]>();
    for (const c of catalogs) {
      const list = catalogByPtId.get(c.ptId) || [];
      list.push(c);
      catalogByPtId.set(c.ptId, list);
    }

    const pawnTerms = await pawnTermRepo.find();
    const termKey = (ptId: string, typeId: string) => `${ptId}_${typeId}`;
    const termsMap = new Map<string, PawnTermEntity>();
    for (const t of pawnTerms) {
      termsMap.set(termKey(t.ptId, t.itemTypeId), t);
    }

    let totalAdded = 0;

    for (const company of companies) {
      const ptId = company.uuid;
      const overdueCount = await spkRepo.count({
        where: { ptId, status: SpkStatusEnum.Overdue },
      });

      if (overdueCount >= TARGET_OVERDUE_PER_PT) {
        continue;
      }

      const ptBranches = branchByPtId.get(ptId) || [];
      const ptCustomers = customerByPtId.get(ptId) || [];
      const ptCatalogs = catalogByPtId.get(ptId) || [];

      if (ptBranches.length === 0 || ptCustomers.length === 0 || ptCatalogs.length === 0) {
        console.log(`  ⚠️ OverdueSpkSeed: Skip ${company.companyCode} (missing branches/customers/catalogs)`);
        continue;
      }

      const toAdd = TARGET_OVERDUE_PER_PT - overdueCount;
      if (toAdd <= 0) continue;

      for (let i = 0; i < toAdd; i++) {
        const branch = ptBranches[i % ptBranches.length]!;
        const customer = ptCustomers[i % ptCustomers.length]!;
        const catalog = ptCatalogs[i % ptCatalogs.length]!;

        const term = termsMap.get(termKey(ptId, catalog.itemTypeId));
        if (!term) continue;

        const createdDate = addDays(new Date(), -30 - i * 5);
        const dueDate = addDays(createdDate, term.tenorMax);

        const principal = catalog.pawnValueMin;
        const interest = (parseFloat(principal) * parseFloat(term.interestRate) / 100).toString();
        const total = (parseFloat(principal) + parseFloat(interest) + parseFloat(term.adminFee)).toString();

        const branchCodePrefix = branch.branchCode ? branch.branchCode.substring(0, 3) : 'BRC';
        const randId = Math.floor(1000 + Math.random() * 9000);
        const spkNumber = `SPK-${branchCodePrefix}-OVD-${Date.now().toString().slice(-4)}-${randId}`;
        const custSpkNumber = `C-OVD-${Date.now().toString().slice(-6)}${randId}`;
        const internalSpkNumber = `I-OVD-${Date.now().toString().slice(-6)}${randId}`;

        const spk = await spkFactory.create({
          spkNumber,
          internalSpkNumber,
          customerSpkNumber: custSpkNumber,
          customerId: customer.uuid,
          storeId: branch.uuid,
          ptId,
          principalAmount: principal,
          tenor: term.tenorMax,
          interestRate: term.interestRate,
          adminFee: term.adminFee,
          totalAmount: total,
          remainingBalance: total,
          dueDate,
          status: SpkStatusEnum.Overdue,
          confirmedAt: createdDate,
          confirmedByPin: true,
          createdAt: createdDate,
          updatedAt: createdDate,
        });

        await itemFactory.create({
          spkId: spk.uuid,
          catalogId: catalog.uuid,
          itemTypeId: catalog.itemTypeId,
          description: catalog.description,
          brand: catalog.name.split(' ')[0],
          model: catalog.name,
          appraisedValue: principal,
          condition: SpkItemConditionEnum.Good,
          storageLocation: `LOC-${branchCodePrefix}-OVD-${randId}`,
          qrCode: `QR-${spkNumber}`,
          status: SpkItemStatusEnum.InStorage,
        });

        totalAdded++;
      }

      console.log(`  ✅ OverdueSpkSeed: ${company.companyCode} — added ${toAdd} overdue SPKs`);
    }

    if (totalAdded > 0) {
      console.log(`\n📊 Overdue SPKs: ${totalAdded} created`);
    }
  }
}
