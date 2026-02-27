import { Seeder } from '@concepta/typeorm-seeding';
import { subDays } from 'date-fns';

import { CapitalTopupEntity } from '../../modules/capital-topup/entities/capital-topup.entity';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { CapitalTopupStatusEnum } from '../../constants/capital-topup-status';
import { dataSource } from '../db.seed';
import { CapitalTopupFactory } from './capital-topup.factory';

/**
 * Capital Topup Seed (Tambah Modal)
 *
 * Creates sample capital topup requests per branch with various statuses:
 * - Pending (Staff submitted, waiting Admin PT approval)
 * - Approved (Admin approved, awaiting disbursement)
 * - Disbursed (completed flow)
 * - Rejected (for history)
 */
export class CapitalTopupSeed extends Seeder {
  async run(): Promise<void> {
    const topupFactory = this.factory(CapitalTopupFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const topupRepo = dataSource.getRepository(CapitalTopupEntity);
    const branchRepo = dataSource.getRepository(BranchEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const existingCount = await topupRepo.count();
    if (existingCount > 0) {
      console.log(`Capital topups already exist (${existingCount}), skipping seed`);
      return;
    }

    const branches = await branchRepo.find({ relations: ['company'] });
    const users = await userRepo.find({
      relations: ['roles'],
      where: {},
    });

    // Map: companyId -> admin user
    const adminByCompany = new Map<string, UserEntity>();
    // Map: branchId -> staff user for that branch
    const staffByBranch = new Map<string, UserEntity>();
    for (const u of users) {
      const roleCodes = u.roles?.map((r) => r.code) ?? [];
      if (roleCodes.includes('company_admin') && u.companyId) {
        adminByCompany.set(u.companyId, u);
      }
      if (roleCodes.includes('branch_staff') && u.branchId) {
        staffByBranch.set(u.branchId, u);
      }
    }

    let totalCreated = 0;

    for (const branch of branches) {
      const ptId = branch.companyId;
      const staff = staffByBranch.get(branch.uuid);
      const admin = adminByCompany.get(ptId);

      if (!staff || !admin) continue;

      const baseCode = `CT-${branch.branchCode ?? 'BR'}-${Date.now().toString().slice(-4)}`;

      // 1. Pending request
      await topupFactory.create({
        topupCode: `${baseCode}-PEND`,
        storeId: branch.uuid,
        ptId,
        amount: '5000000',
        reason: 'Kebutuhan modal operasional minggu ini',
        status: CapitalTopupStatusEnum.Pending,
        requestedBy: staff.uuid,
      });
      totalCreated++;

      // 2. Approved request (awaiting disbursement)
      await topupFactory.create({
        topupCode: `${baseCode}-APPR`,
        storeId: branch.uuid,
        ptId,
        amount: '10000000',
        reason: 'Persiapan lebaran - stok emas',
        status: CapitalTopupStatusEnum.Approved,
        requestedBy: staff.uuid,
        approvedBy: admin.uuid,
        approvedAt: subDays(new Date(), 2),
        notes: 'Disetujui, menunggu transfer',
      });
      totalCreated++;

      // 3. Disbursed request (completed)
      await topupFactory.create({
        topupCode: `${baseCode}-DISP`,
        storeId: branch.uuid,
        ptId,
        amount: '15000000',
        reason: 'Modal tambahan bulan lalu',
        status: CapitalTopupStatusEnum.Disbursed,
        requestedBy: staff.uuid,
        approvedBy: admin.uuid,
        approvedAt: subDays(new Date(), 10),
        disbursedAt: subDays(new Date(), 9),
        disbursementProofUrl: 'https://placeholder.com/proof.jpg',
        notes: 'Transfer selesai',
      });
      totalCreated++;

      // 4. Rejected request (for history)
      await topupFactory.create({
        topupCode: `${baseCode}-REJ`,
        storeId: branch.uuid,
        ptId,
        amount: '25000000',
        reason: 'Request modal besar',
        status: CapitalTopupStatusEnum.Rejected,
        requestedBy: staff.uuid,
        approvedBy: admin.uuid,
        approvedAt: subDays(new Date(), 5),
        rejectionReason: 'Anggaran bulan ini sudah terpenuhi',
      });
      totalCreated++;
    }

    console.log(`\n📊 Seeded ${totalCreated} capital topups across ${branches.length} branches`);
  }
}
