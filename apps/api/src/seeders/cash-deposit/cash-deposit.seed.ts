import { Seeder } from '@concepta/typeorm-seeding';
import { subDays } from 'date-fns';

import { CashDepositEntity } from '../../modules/cash-deposit/entities/cash-deposit.entity';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { CashDepositStatusEnum } from '../../constants/cash-deposit-status';
import { dataSource } from '../db.seed';
import { CashDepositFactory } from './cash-deposit.factory';

/**
 * Cash Deposit Seed (Setor Uang)
 *
 * Creates sample cash deposits per branch with various statuses:
 * - Pending  (VA generated, waiting payment from Staff Toko)
 * - Lunas    (payment received via Xendit webhook — auto-confirmed)
 * - Expired  (VA expired end-of-day without payment)
 *
 * Admin PT creates deposits; Staff Toko pays via VA.
 */
export class CashDepositSeed extends Seeder {
  async run(): Promise<void> {
    const depositFactory = this.factory(CashDepositFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const depositRepo = dataSource.getRepository(CashDepositEntity);
    const branchRepo = dataSource.getRepository(BranchEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const existingCount = await depositRepo.count();
    if (existingCount > 0) {
      console.log(`Cash deposits already exist (${existingCount}), skipping seed`);
      return;
    }

    const branches = await branchRepo.find();
    const users = await userRepo.find({
      relations: ['roles'],
      where: {},
    });

    const adminByCompany = new Map<string, UserEntity>();
    for (const u of users) {
      const roleCodes = u.roles?.map((r) => r.code) ?? [];
      if (roleCodes.includes('company_admin') && u.companyId) {
        adminByCompany.set(u.companyId, u);
      }
    }

    let totalCreated = 0;

    for (const branch of branches) {
      const ptId = branch.companyId;
      const admin = adminByCompany.get(ptId);
      if (!admin) continue;

      const baseCode = `CD-${branch.branchCode ?? 'BR'}-${Date.now().toString().slice(-4)}`;

      // 1. Pending deposit — VA generated, waiting payment
      const todayEnd = new Date();
      todayEnd.setUTCHours(16, 59, 59, 999); // 23:59:59 WIB
      await depositFactory.create({
        depositCode: `${baseCode}-PEND`,
        storeId: branch.uuid,
        ptId,
        amount: '3000000',
        virtualAccount: `808${branch.branchCode?.slice(-3) ?? '001'}00001`,
        xenditExternalId: `xendit-ext-${baseCode}-PEND`,
        status: CashDepositStatusEnum.Pending,
        expiresAt: todayEnd,
        requestedBy: admin.uuid,
        notes: 'Setoran harian cabang',
      });
      totalCreated++;

      // 2. Lunas deposit — payment completed via webhook
      await depositFactory.create({
        depositCode: `${baseCode}-LUNAS`,
        storeId: branch.uuid,
        ptId,
        amount: '5000000',
        virtualAccount: `808${branch.branchCode?.slice(-3) ?? '002'}00002`,
        xenditExternalId: `xendit-ext-${baseCode}-LUNAS`,
        status: CashDepositStatusEnum.Lunas,
        expiresAt: subDays(new Date(), 1),
        requestedBy: admin.uuid,
        notes: null,
      });
      totalCreated++;

      // 3. Expired deposit — VA expired without payment
      const expiredDate = subDays(new Date(), 3);
      expiredDate.setUTCHours(16, 59, 59, 999);
      await depositFactory.create({
        depositCode: `${baseCode}-EXP`,
        storeId: branch.uuid,
        ptId,
        amount: '2000000',
        virtualAccount: `808${branch.branchCode?.slice(-3) ?? '003'}00003`,
        xenditExternalId: `xendit-ext-${baseCode}-EXP`,
        status: CashDepositStatusEnum.Expired,
        expiresAt: expiredDate,
        requestedBy: admin.uuid,
        notes: null,
      });
      totalCreated++;
    }

    console.log(`\n📊 Seeded ${totalCreated} cash deposits across ${branches.length} branches`);
  }
}
