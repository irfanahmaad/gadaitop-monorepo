import { Seeder } from '@concepta/typeorm-seeding';
import { addDays, subDays } from 'date-fns';

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

/**
 * SPK Seed
 * 
 * Creates sample SPK (pawn contracts) for demo scenarios.
 * Scenarios per company:
 * - Active SPKs (New, due soon)
 * - Overdue SPKs (For auction demo)
 * - Draft SPKs (Not finalized)
 * - Redeemed/Closed SPKs
 */
export class SpkSeed extends Seeder {
  async run(): Promise<void> {
    const spkFactory = this.factory(SpkRecordFactory);
    const itemFactory = this.factory(SpkItemFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const spkRepo = dataSource.getRepository(SpkRecordEntity);
    const branchRepo = dataSource.getRepository(BranchEntity);
    const customerRepo = dataSource.getRepository(CustomerEntity);
    const catalogRepo = dataSource.getRepository(CatalogEntity);
    const pawnTermRepo = dataSource.getRepository(PawnTermEntity);

    // Check if SPK exist
    const existingCount = await spkRepo.count();
    if (existingCount > 0) {
      console.log(`SPKs already exist (${existingCount}), skipping seed`);
      return;
    }

    // Get resources
    const branches = await branchRepo.find({ relations: ['company'] });
    const customers = await customerRepo.find();
    const catalogs = await catalogRepo.find({ relations: ['itemType'] });
    const pawnTerms = await pawnTermRepo.find();

    if (branches.length === 0 || customers.length === 0 || catalogs.length === 0) {
      console.log('⚠️ Missing dependencies (Branches, Customers, or Catalogs). Run previous seeders first.');
      return;
    }

    // Map for quick access
    const customerByPt = new Map<string, CustomerEntity[]>();
    for (const c of customers) {
      const list = customerByPt.get(c.ptId) || [];
      list.push(c);
      customerByPt.set(c.ptId, list);
    }

    const catalogByPt = new Map<string, CatalogEntity[]>();
    for (const c of catalogs) {
      const list = catalogByPt.get(c.ptId) || [];
      list.push(c);
      catalogByPt.set(c.ptId, list);
    }

    const termKey = (ptId: string, typeId: string) => `${ptId}_${typeId}`;
    const termsMap = new Map<string, PawnTermEntity>();
    for (const t of pawnTerms) {
      termsMap.set(termKey(t.ptId, t.itemTypeId), t);
    }

    let totalSpk = 0;

    // Process each branch
    for (const branch of branches) {
      const ptId = branch.companyId;
      const ptCustomers = customerByPt.get(ptId) || [];
      const ptCatalogs = catalogByPt.get(ptId) || [];

      if (ptCustomers.length === 0 || ptCatalogs.length === 0) continue;

      // Define scenarios for this branch
      const scenarios = [
        { status: SpkStatusEnum.Active, offsetDays: -2, desc: 'Active - Newly created' },
        { status: SpkStatusEnum.Active, offsetDays: -10, desc: 'Active - Due soon' },
        { status: SpkStatusEnum.Overdue, offsetDays: -35, desc: 'Overdue - Ready for auction' },
        { status: SpkStatusEnum.Overdue, offsetDays: -40, desc: 'Overdue - Late' },
        { status: SpkStatusEnum.Draft, offsetDays: 0, desc: 'Draft - In progress' },
        { status: SpkStatusEnum.Redeemed, offsetDays: -60, desc: 'Redeemed - History' },
        { status: SpkStatusEnum.Closed, offsetDays: -60, desc: 'Closed - Finished' },
      ];

      let custIdx = 0;

      for (const scenario of scenarios) {
        // Rotate customer
        const customer = ptCustomers[custIdx % ptCustomers.length];
        custIdx++;

        // Select a random catalog item
        const catalog = ptCatalogs[Math.floor(Math.random() * ptCatalogs.length)];
        
        // Get terms
        const term = termsMap.get(termKey(ptId, catalog.itemTypeId));
        if (!term) continue; // Should not happen if data is consistent

        // Dates
        const createdDate = addDays(new Date(), scenario.offsetDays);
        const dueDate = addDays(createdDate, term.tenorDefault);
        
        // Calculate visuals
        const principal = catalog.pawnValueMin; // Use min value for simplicity
        const interest = (parseFloat(principal) * parseFloat(term.interestRate) / 100).toString();
        const total = (parseFloat(principal) + parseFloat(interest) + parseFloat(term.adminFee)).toString();

        // SPK Number generation (Simple demo format)
        // Format: SPK-[BranchCode]-[Random]
        const branchCodePrefix = branch.branchCode ? branch.branchCode.substring(0, 3) : 'BRC';
        const randId = Math.floor(1000 + Math.random() * 9000);
        const spkNumber = `SPK-${branchCodePrefix}-${Date.now().toString().slice(-4)}-${randId}`;
        const custSpkNumber = `C-${Date.now().toString().slice(-6)}${randId}`;
        const internalSpkNumber = `I-${Date.now().toString().slice(-6)}${randId}`;

        // Determing confirmation status
        let confirmedAt = null;
        let confirmedByPin = false;
        if (scenario.status !== SpkStatusEnum.Draft) {
          confirmedAt = createdDate;
          confirmedByPin = true;
        }

        // Create SPK
        const spk = await spkFactory.create({
          spkNumber,
          internalSpkNumber,
          customerSpkNumber: custSpkNumber,
          customerId: customer.uuid,
          storeId: branch.uuid,
          ptId: ptId,
          principalAmount: principal,
          tenor: term.tenorDefault,
          interestRate: term.interestRate,
          adminFee: term.adminFee,
          totalAmount: total,
          remainingBalance: scenario.status === SpkStatusEnum.Redeemed ? '0' : total, // Simplified logic
          dueDate,
          status: scenario.status,
          confirmedAt,
          confirmedByPin,
          createdAt: createdDate,
          updatedAt: createdDate,
        });

        // Determine item status based on SPK status
        let itemStatus = SpkItemStatusEnum.InStorage;
        if (scenario.status === SpkStatusEnum.Redeemed || scenario.status === SpkStatusEnum.Closed) {
           itemStatus = SpkItemStatusEnum.Returned;
        } else if (scenario.status === SpkStatusEnum.Auctioned) {
           itemStatus = SpkItemStatusEnum.InAuction;
        }

        // Create SPK Item
        await itemFactory.create({
          spkId: spk.uuid,
          catalogId: catalog.uuid,
          itemTypeId: catalog.itemTypeId,
          description: catalog.description,
          brand: catalog.name.split(' ')[0],
          model: catalog.name,
          appraisedValue: principal,
          condition: SpkItemConditionEnum.Good,
          storageLocation: `LOC-${branchCodePrefix}-${randId}`,
          qrCode: `QR-${spkNumber}`,
          status: itemStatus,
        });

        totalSpk++;
      }
    }

    console.log(`✅ Seeded ${totalSpk} SPKs across ${branches.length} branches`);
  }
}
