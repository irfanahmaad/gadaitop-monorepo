import { Seeder } from '@concepta/typeorm-seeding';

import { ActiveStatusEnum } from '../../constants/active-status';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { dataSource } from '../db.seed';
import { CompanyFactory } from './company.factory';

export class CompanySeed extends Seeder {
  async run(): Promise<void> {
    const companyFactory = this.factory(CompanyFactory);

    // Initialize dataSource if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // Check if companies already exist
    try {
      const existingCompanies = await dataSource
        .getRepository(CompanyEntity)
        .find();

      if (existingCompanies.length > 0) {
        console.log('Companies already exist, skipping seed');
        return;
      }
    } catch (error) {
      console.log('Could not check existing companies, proceeding with seed...');
    }

    // Get the super admin user (owner)
    const owner = await dataSource
      .getRepository(UserEntity)
      .findOne({ where: { email: 'admin@gadaitop.com' } });

    if (!owner) {
      throw new Error(
        'Super admin user not found. Please run UserSeed first.',
      );
    }

    // Create default company for the owner
    const company = await companyFactory.create({
      companyCode: 'PT001',
      companyName: 'PT Gadai Top Indonesia',
      phoneNumber: '+6281234567890',
      address: 'Jl. Sudirman No. 1, Jakarta Pusat',
      ownerId: owner.uuid,
      earlyInterestRate: 5.0,
      normalInterestRate: 10.0,
      adminFeeRate: 0.0,
      insuranceFee: 0.0,
      latePenaltyRate: 2.0,
      minPrincipalPayment: 50000.0,
      defaultTenorDays: 30,
      earlyPaymentDays: 15,
      activeStatus: ActiveStatusEnum.Active,
    });

    // Update owner's ownedCompanyId
    owner.ownedCompanyId = company.uuid;
    await dataSource.getRepository(UserEntity).save(owner);

    console.log('✅ Seeded company successfully');
    console.log(`   Company Code: ${company.companyCode}`);
    console.log(`   Company Name: ${company.companyName}`);
    console.log(`   Owner: ${owner.fullName} (${owner.email})`);
  }
}
