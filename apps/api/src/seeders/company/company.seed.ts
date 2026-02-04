import { Seeder } from '@concepta/typeorm-seeding';

import { ActiveStatusEnum } from '../../constants/active-status';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { RoleEntity } from '../../modules/role/entities/role.entity';
import { dataSource } from '../db.seed';
import { CompanyFactory } from './company.factory';
import { UserFactory } from '../user/user.factory';

interface SampleCompany {
  companyCode: string;
  companyName: string;
  phoneNumber: string;
  address: string;
  ownerEmail: string;
  ownerName: string;
}

/**
 * Company Seed
 * 
 * Creates multiple companies for simulation, each with their own owner.
 */
export class CompanySeed extends Seeder {
  async run(): Promise<void> {
    const companyFactory = this.factory(CompanyFactory);
    const userFactory = this.factory(UserFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const companyRepo = dataSource.getRepository(CompanyEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const roleRepo = dataSource.getRepository(RoleEntity);

    // Check if companies already exist
    const existingCompanies = await companyRepo.find();
    if (existingCompanies.length > 0) {
      console.log('Companies already exist, skipping seed');
      return;
    }

    // Get owner role for company owners
    const ownerRole = await roleRepo.findOne({ where: { code: 'owner' } });
    if (!ownerRole) {
      throw new Error('owner role not found. Please run RoleSeed first.');
    }

    // Get super admin (created by UserSeed)
    const superAdmin = await userRepo.findOne({ where: { email: 'admin@gadaitop.com' } });
    if (!superAdmin) {
      throw new Error('Super admin not found. Please run UserSeed first.');
    }

    // Sample companies
    const sampleCompanies: SampleCompany[] = [
      {
        companyCode: 'PT001',
        companyName: 'PT Gadai Top Indonesia',
        phoneNumber: '+6281234567890',
        address: 'Jl. Sudirman No. 1, Jakarta Pusat 10220',
        ownerEmail: 'admin@gadaitop.com', // Uses existing super admin
        ownerName: 'Super Admin',
      },
      {
        companyCode: 'PT002',
        companyName: 'PT Gadai Sejahtera',
        phoneNumber: '+6281234567100',
        address: 'Jl. Gatot Subroto No. 50, Jakarta Selatan 12950',
        ownerEmail: 'owner.sejahtera@test.com',
        ownerName: 'Agus Setiawan',
      },
      {
        companyCode: 'PT003',
        companyName: 'PT Gadai Makmur Jaya',
        phoneNumber: '+6281234567200',
        address: 'Jl. Asia Afrika No. 100, Bandung 40112',
        ownerEmail: 'owner.makmur@test.com',
        ownerName: 'Bambang Susanto',
      },
    ];

    for (const data of sampleCompanies) {
      let owner: UserEntity;

      // Check if this is the super admin
      if (data.ownerEmail === 'admin@gadaitop.com') {
        owner = superAdmin;
      } else {
        // Create new owner
        owner = await userFactory.create({
          email: data.ownerEmail,
          password: 'test123',
          fullName: data.ownerName,
          activeStatus: ActiveStatusEnum.Active,
          isEmailVerified: true,
          isPhoneVerified: false,
        });
        owner.roles = [ownerRole];
        await userRepo.save(owner);
      }

      // Create company
      const company = await companyFactory.create({
        companyCode: data.companyCode,
        companyName: data.companyName,
        phoneNumber: data.phoneNumber,
        address: data.address,
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
      await userRepo.save(owner);

      console.log(`  ✅ ${company.companyCode}: ${company.companyName} (Owner: ${data.ownerName})`);
    }

    console.log(`\n📊 Seeded ${sampleCompanies.length} companies`);
  }
}
