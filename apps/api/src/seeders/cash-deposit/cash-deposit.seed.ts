import { Seeder } from '@concepta/typeorm-seeding';
import { subDays } from 'date-fns';

import { CashDepositEntity } from '../../modules/cash-deposit/entities/cash-deposit.entity';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { CashDepositStatusEnum } from '../../constants/cash-deposit-status';
import { CashDepositPaymentMethodEnum } from '../../constants/cash-deposit-payment-method';
import { dataSource } from '../db.seed';
import { CashDepositFactory } from './cash-deposit.factory';

/**
 * Cash Deposit Seed (Setor Uang)
 *
 * Creates sample cash deposits per branch with various statuses:
 * - Pending (request submitted, waiting payment)
 * - Paid (payment received, waiting confirmation)
 * - Confirmed (completed)
 * - Rejected (for history)
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

      const baseCode = `CD-${branch.branchCode ?? 'BR'}-${Date.now().toString().slice(-4)}`;

      // 1. Pending deposit (bank transfer)
      await depositFactory.create({
        depositCode: `${baseCode}-PEND`,
        storeId: branch.uuid,
        ptId,
        amount: '3000000',
        paymentMethod: CashDepositPaymentMethodEnum.BankTransfer,
        paymentChannel: 'BCA',
        status: CashDepositStatusEnum.Pending,
        requestedBy: staff.uuid,
      });
      totalCreated++;

      // 2. Paid deposit (waiting confirmation)
      await depositFactory.create({
        depositCode: `${baseCode}-PAID`,
        storeId: branch.uuid,
        ptId,
        amount: '5000000',
        paymentMethod: CashDepositPaymentMethodEnum.BankTransfer,
        paymentChannel: 'Mandiri',
        paymentProofUrl: 'https://placeholder.com/proof.jpg',
        status: CashDepositStatusEnum.Paid,
        requestedBy: staff.uuid,
      });
      totalCreated++;

      // 3. Confirmed deposit (completed)
      await depositFactory.create({
        depositCode: `${baseCode}-CONF`,
        storeId: branch.uuid,
        ptId,
        amount: '7500000',
        paymentMethod: CashDepositPaymentMethodEnum.Qris,
        paymentChannel: 'QRIS',
        qrCodeUrl: 'https://placeholder.com/qr.png',
        paymentProofUrl: 'https://placeholder.com/proof2.jpg',
        status: CashDepositStatusEnum.Confirmed,
        requestedBy: staff.uuid,
        approvedBy: admin.uuid,
        approvedAt: subDays(new Date(), 3),
        notes: 'Transfer diterima',
      });
      totalCreated++;

      // 4. Rejected deposit (for history)
      await depositFactory.create({
        depositCode: `${baseCode}-REJ`,
        storeId: branch.uuid,
        ptId,
        amount: '2000000',
        paymentMethod: CashDepositPaymentMethodEnum.VirtualAccount,
        virtualAccount: '1234567890',
        status: CashDepositStatusEnum.Rejected,
        requestedBy: staff.uuid,
        approvedBy: admin.uuid,
        approvedAt: subDays(new Date(), 7),
        rejectionReason: 'Bukti transfer tidak valid',
      });
      totalCreated++;
    }

    console.log(`\n📊 Seeded ${totalCreated} cash deposits across ${branches.length} branches`);
  }
}
