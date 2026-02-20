import { Seeder } from '@concepta/typeorm-seeding';

import { PawnTermEntity } from '../../modules/pawn-term/entities/pawn-term.entity';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { ItemTypeEntity } from '../../modules/item-type/entities/item-type.entity';
import { dataSource } from '../db.seed';
import { PawnTermFactory } from './pawn-term.factory';

interface PawnTermConfig {
  itemTypeCode: string;
  loanLimitMin: string;
  loanLimitMax: string;
  tenorDefault: number;
  interestRate: string;
  adminFee: string;
}

/**
 * PawnTerm Seed
 * 
 * Configures lending terms per company and item type.
 * Required before SPK creation to calculate loan amounts and interest.
 */
export class PawnTermSeed extends Seeder {
  async run(): Promise<void> {
    const pawnTermFactory = this.factory(PawnTermFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const pawnTermRepo = dataSource.getRepository(PawnTermEntity);
    const companyRepo = dataSource.getRepository(CompanyEntity);
    const itemTypeRepo = dataSource.getRepository(ItemTypeEntity);

    // Check if pawn terms exist
    const existingCount = await pawnTermRepo.count();
    if (existingCount > 0) {
      console.log(`Pawn terms already exist (${existingCount}), skipping seed`);
      return;
    }

    // Get all companies and item types
    const companies = await companyRepo.find();
    const itemTypes = await itemTypeRepo.find();
    const itemTypeByCode = new Map(itemTypes.map(it => [it.typeCode, it]));

    if (companies.length === 0) {
      console.log('⚠️ No companies found. Run CompanySeed first.');
      return;
    }

    // Pawn term configurations per item type
    const termConfigs: PawnTermConfig[] = [
      { itemTypeCode: 'E', loanLimitMin: '500000', loanLimitMax: '50000000', tenorDefault: 30, interestRate: '1.50', adminFee: '25000' },
      { itemTypeCode: 'H', loanLimitMin: '500000', loanLimitMax: '20000000', tenorDefault: 14, interestRate: '2.00', adminFee: '50000' },
      { itemTypeCode: 'L', loanLimitMin: '1000000', loanLimitMax: '30000000', tenorDefault: 30, interestRate: '2.00', adminFee: '75000' },
      { itemTypeCode: 'M', loanLimitMin: '2000000', loanLimitMax: '50000000', tenorDefault: 30, interestRate: '1.80', adminFee: '100000' },
      { itemTypeCode: 'K', loanLimitMin: '5000000', loanLimitMax: '100000000', tenorDefault: 30, interestRate: '1.50', adminFee: '150000' },
      { itemTypeCode: 'T', loanLimitMin: '500000', loanLimitMax: '15000000', tenorDefault: 14, interestRate: '2.50', adminFee: '50000' },
      { itemTypeCode: 'O', loanLimitMin: '100000', loanLimitMax: '10000000', tenorDefault: 14, interestRate: '3.00', adminFee: '25000' },
    ];

    let totalCreated = 0;

    for (const company of companies) {
      for (const config of termConfigs) {
        const itemType = itemTypeByCode.get(config.itemTypeCode);
        if (!itemType) continue;

        await pawnTermFactory.create({
          ptId: company.uuid,
          itemTypeId: itemType.uuid,
          loanLimitMin: config.loanLimitMin,
          loanLimitMax: config.loanLimitMax,
          tenorDefault: config.tenorDefault,
          interestRate: config.interestRate,
          adminFee: config.adminFee,
          itemCondition: 'present_and_matching',
        });
        totalCreated++;
      }
    }

    console.log(`✅ Seeded ${totalCreated} pawn terms across ${companies.length} companies`);
  }
}
