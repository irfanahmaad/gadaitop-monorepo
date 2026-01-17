import { Seeder } from '@concepta/typeorm-seeding';

import { BranchStatusEnum } from '../../constants/branch-status';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { dataSource } from '../db.seed';
import { BranchFactory } from './branch.factory';

export class BranchSeed extends Seeder {
  async run(): Promise<void> {
    const branchFactory = this.factory(BranchFactory);

    // Initialize dataSource if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // Check if branches already exist
    try {
      const existingBranches = await dataSource
        .getRepository(BranchEntity)
        .find();

      if (existingBranches.length > 0) {
        console.log('Branches already exist, skipping seed');
        return;
      }
    } catch (error) {
      console.log('Could not check existing branches, proceeding with seed...');
    }

    // Get the default company
    const company = await dataSource
      .getRepository(CompanyEntity)
      .findOne({ where: { companyCode: 'PT001' } });

    if (!company) {
      throw new Error(
        'Default company not found. Please run CompanySeed first.',
      );
    }

    // Create sample branches
    const branches = [
      {
        branchCode: 'JKT001',
        shortName: 'Jakarta Pusat',
        fullName: 'Cabang Jakarta Pusat',
        address: 'Jl. Sudirman No. 1, Jakarta Pusat 10220',
        phone: '+6281234567891',
        city: 'Jakarta',
        companyId: company.uuid,
        isBorrowed: false,
        status: BranchStatusEnum.Active,
        transactionSequence: 0,
      },
      {
        branchCode: 'BDG001',
        shortName: 'Bandung',
        fullName: 'Cabang Bandung',
        address: 'Jl. Dago No. 100, Bandung 40135',
        phone: '+6281234567892',
        city: 'Bandung',
        companyId: company.uuid,
        isBorrowed: false,
        status: BranchStatusEnum.Active,
        transactionSequence: 0,
      },
      {
        branchCode: 'SBY001',
        shortName: 'Surabaya',
        fullName: 'Cabang Surabaya',
        address: 'Jl. Pemuda No. 200, Surabaya 60271',
        phone: '+6281234567893',
        city: 'Surabaya',
        companyId: company.uuid,
        isBorrowed: false,
        status: BranchStatusEnum.Active,
        transactionSequence: 0,
      },
    ];

    await Promise.all(
      branches.map((branchData) => branchFactory.create(branchData)),
    );

    console.log(`✅ Seeded ${branches.length} branches successfully`);
    branches.forEach((branch) => {
      console.log(`   - ${branch.branchCode}: ${branch.fullName}`);
    });
  }
}
