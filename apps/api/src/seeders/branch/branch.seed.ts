import { Seeder } from '@concepta/typeorm-seeding';

import { BranchStatusEnum } from '../../constants/branch-status';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { dataSource } from '../db.seed';
import { BranchFactory } from './branch.factory';

interface SampleBranch {
  branchCode: string;
  shortName: string;
  fullName: string;
  address: string;
  phone: string;
  city: string;
  companyCode: string;
}

/**
 * Branch Seed
 * 
 * Creates branches for all companies.
 */
export class BranchSeed extends Seeder {
  async run(): Promise<void> {
    const branchFactory = this.factory(BranchFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const branchRepo = dataSource.getRepository(BranchEntity);
    const companyRepo = dataSource.getRepository(CompanyEntity);

    // Check if branches already exist
    const existingBranches = await branchRepo.find();
    if (existingBranches.length > 0) {
      console.log('Branches already exist, skipping seed');
      return;
    }

    // Get all companies
    const companies = await companyRepo.find();
    const companyByCode = new Map(companies.map(c => [c.companyCode, c]));

    // Sample branches for each company
    const sampleBranches: SampleBranch[] = [
      // PT001 - PT Gadai Top Indonesia (3 branches)
      {
        branchCode: 'JKT001',
        shortName: 'Jakarta Pusat',
        fullName: 'Cabang Jakarta Pusat',
        address: 'Jl. Sudirman No. 1, Jakarta Pusat 10220',
        phone: '+6281234567891',
        city: 'Jakarta',
        companyCode: 'PT001',
      },
      {
        branchCode: 'BDG001',
        shortName: 'Bandung',
        fullName: 'Cabang Bandung',
        address: 'Jl. Dago No. 100, Bandung 40135',
        phone: '+6281234567892',
        city: 'Bandung',
        companyCode: 'PT001',
      },
      {
        branchCode: 'SBY001',
        shortName: 'Surabaya',
        fullName: 'Cabang Surabaya',
        address: 'Jl. Pemuda No. 200, Surabaya 60271',
        phone: '+6281234567893',
        city: 'Surabaya',
        companyCode: 'PT001',
      },
      // PT002 - PT Gadai Sejahtera (2 branches)
      {
        branchCode: 'JKS001',
        shortName: 'Jakarta Selatan',
        fullName: 'Cabang Sejahtera Jakarta Selatan',
        address: 'Jl. Gatot Subroto No. 55, Jakarta Selatan 12950',
        phone: '+6281234567101',
        city: 'Jakarta',
        companyCode: 'PT002',
      },
      {
        branchCode: 'TNG001',
        shortName: 'Tangerang',
        fullName: 'Cabang Sejahtera Tangerang',
        address: 'Jl. Raya Serpong No. 10, Tangerang 15310',
        phone: '+6281234567102',
        city: 'Tangerang',
        companyCode: 'PT002',
      },
      // PT003 - PT Gadai Makmur Jaya (2 branches)
      {
        branchCode: 'BDG002',
        shortName: 'Bandung Timur',
        fullName: 'Cabang Makmur Bandung Timur',
        address: 'Jl. Soekarno Hatta No. 500, Bandung 40286',
        phone: '+6281234567201',
        city: 'Bandung',
        companyCode: 'PT003',
      },
      {
        branchCode: 'CRB001',
        shortName: 'Cirebon',
        fullName: 'Cabang Makmur Cirebon',
        address: 'Jl. Siliwangi No. 88, Cirebon 45131',
        phone: '+6281234567202',
        city: 'Cirebon',
        companyCode: 'PT003',
      },
    ];

    let created = 0;

    for (const data of sampleBranches) {
      const company = companyByCode.get(data.companyCode);
      if (!company) {
        console.log(`  ⚠️ Company ${data.companyCode} not found for branch ${data.branchCode}`);
        continue;
      }

      await branchFactory.create({
        branchCode: data.branchCode,
        shortName: data.shortName,
        fullName: data.fullName,
        address: data.address,
        phone: data.phone,
        city: data.city,
        companyId: company.uuid,
        isBorrowed: false,
        status: BranchStatusEnum.Active,
        transactionSequence: 0,
      });
      created++;
      console.log(`  ✅ ${data.branchCode}: ${data.fullName} (${data.companyCode})`);
    }

    console.log(`\n📊 Seeded ${created} branches across ${companies.length} companies`);
  }
}
