import { Seeder } from '@concepta/typeorm-seeding';

import { ActiveStatusEnum } from '../../constants/active-status';
import { RoleEntity } from '../../modules/role/entities/role.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { dataSource } from '../db.seed';
import { UserFactory } from '../user/user.factory';

interface TestUser {
  email: string;
  fullName: string;
  roleCode: string;
  companyCode: string;
  branchCode?: string;
}

/**
 * Admin Users Seed
 * 
 * Creates test users for each role across all companies.
 * Password for all: test123
 */
export class AdminUsersSeed extends Seeder {
  async run(): Promise<void> {
    const userFactory = this.factory(UserFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const roleRepo = dataSource.getRepository(RoleEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const branchRepo = dataSource.getRepository(BranchEntity);
    const companyRepo = dataSource.getRepository(CompanyEntity);

    // Get all companies and branches
    const companies = await companyRepo.find();
    const companyByCode = new Map(companies.map(c => [c.companyCode, c]));

    const branches = await branchRepo.find();
    const branchByCode = new Map(branches.map(b => [b.branchCode, b]));

    // Define test users for each company
    const testUsers: TestUser[] = [
      // PT001 - PT Gadai Top Indonesia
      { email: 'admin.pt001@test.com', fullName: 'Admin PT001', roleCode: 'company_admin', companyCode: 'PT001' },
      { email: 'staff.jkt001@test.com', fullName: 'Staff Jakarta Pusat', roleCode: 'branch_staff', companyCode: 'PT001', branchCode: 'JKT001' },
      { email: 'staff.bdg001@test.com', fullName: 'Staff Bandung', roleCode: 'branch_staff', companyCode: 'PT001', branchCode: 'BDG001' },
      { email: 'staff.sby001@test.com', fullName: 'Staff Surabaya', roleCode: 'branch_staff', companyCode: 'PT001', branchCode: 'SBY001' },
      { email: 'so.pt001@test.com', fullName: 'Stock Opname PT001', roleCode: 'stock_auditor', companyCode: 'PT001', branchCode: 'JKT001' },
      { email: 'lelang.pt001@test.com', fullName: 'Lelang PT001', roleCode: 'auction_staff', companyCode: 'PT001' },
      { email: 'marketing.pt001@test.com', fullName: 'Marketing PT001', roleCode: 'marketing', companyCode: 'PT001' },

      // PT002 - PT Gadai Sejahtera
      { email: 'admin.pt002@test.com', fullName: 'Admin PT002', roleCode: 'company_admin', companyCode: 'PT002' },
      { email: 'staff.jks001@test.com', fullName: 'Staff Jakarta Selatan', roleCode: 'branch_staff', companyCode: 'PT002', branchCode: 'JKS001' },
      { email: 'staff.tng001@test.com', fullName: 'Staff Tangerang', roleCode: 'branch_staff', companyCode: 'PT002', branchCode: 'TNG001' },

      // PT003 - PT Gadai Makmur Jaya
      { email: 'admin.pt003@test.com', fullName: 'Admin PT003', roleCode: 'company_admin', companyCode: 'PT003' },
      { email: 'staff.bdg002@test.com', fullName: 'Staff Bandung Timur', roleCode: 'branch_staff', companyCode: 'PT003', branchCode: 'BDG002' },
      { email: 'staff.crb001@test.com', fullName: 'Staff Cirebon', roleCode: 'branch_staff', companyCode: 'PT003', branchCode: 'CRB001' },
    ];

    let created = 0;
    let skipped = 0;

    for (const testUser of testUsers) {
      // Check if user already exists
      const existing = await userRepo.findOne({ where: { email: testUser.email } });
      if (existing) {
        skipped++;
        continue;
      }

      // Get role
      const role = await roleRepo.findOne({ where: { code: testUser.roleCode } });
      if (!role) {
        console.log(`  ⚠️ Role ${testUser.roleCode} not found`);
        continue;
      }

      // Get company
      const company = companyByCode.get(testUser.companyCode);
      if (!company) {
        console.log(`  ⚠️ Company ${testUser.companyCode} not found`);
        continue;
      }

      // Get branch if specified
      const branch = testUser.branchCode ? branchByCode.get(testUser.branchCode) : undefined;

      // Create user
      const user = await userFactory.create({
        email: testUser.email,
        password: 'test123',
        fullName: testUser.fullName,
        activeStatus: ActiveStatusEnum.Active,
        isEmailVerified: true,
        isPhoneVerified: false,
        companyId: company.uuid,
        branchId: branch?.uuid ?? null,
      });

      user.roles = [role];
      await userRepo.save(user);
      created++;
      console.log(`  ✅ ${testUser.email} (${testUser.roleCode}@${testUser.companyCode})`);
    }

    console.log(`\n📊 Admin Users: ${created} created, ${skipped} skipped`);
    console.log('   Password for all: test123');
  }
}
