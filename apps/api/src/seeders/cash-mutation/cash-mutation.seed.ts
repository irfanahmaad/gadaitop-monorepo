import { Seeder } from '@concepta/typeorm-seeding';
import { subDays } from 'date-fns';

import { CashMutationEntity } from '../../modules/cash-mutation/entities/cash-mutation.entity';
import { BranchEntity } from '../../modules/branch/entities/branch.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { CashMutationTypeEnum } from '../../constants/cash-mutation-type';
import { CashMutationCategoryEnum } from '../../constants/cash-mutation-category';
import { dataSource } from '../db.seed';
import { CashMutationFactory } from './cash-mutation.factory';

/**
 * Cash Mutation Seed (Mutasi Transaksi)
 *
 * Creates sample cash mutation history per branch with running balance:
 * - SPK disbursement (debit)
 * - NKB payment received (credit)
 * - Deposit (credit)
 * - Topup received (credit)
 * - Expense (debit)
 */
export class CashMutationSeed extends Seeder {
  async run(): Promise<void> {
    const mutationFactory = this.factory(CashMutationFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const mutationRepo = dataSource.getRepository(CashMutationEntity);
    const branchRepo = dataSource.getRepository(BranchEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const existingCount = await mutationRepo.count();
    if (existingCount > 0) {
      console.log(`Cash mutations already exist (${existingCount}), skipping seed`);
      return;
    }

    const branches = await branchRepo.find();
    const users = await userRepo.find({
      relations: ['roles'],
      where: {},
    });

    const staffByBranch = new Map<string, UserEntity>();
    for (const u of users) {
      const roleCodes = u.roles?.map((r) => r.code) ?? [];
      if (roleCodes.includes('branch_staff') && u.branchId) {
        staffByBranch.set(u.branchId, u);
      }
    }

    let totalCreated = 0;

    for (const branch of branches) {
      const ptId = branch.companyId;
      const creator = staffByBranch.get(branch.uuid);
      if (!creator) continue;

      let balance = 10000000; // Starting balance 10M

      const mutations: Array<{
        mutationDate: Date;
        mutationType: CashMutationTypeEnum;
        category: CashMutationCategoryEnum;
        amount: string;
        description: string;
        referenceType?: string;
        referenceId?: string;
      }> = [
        {
          mutationDate: subDays(new Date(), 14),
          mutationType: CashMutationTypeEnum.Debit,
          category: CashMutationCategoryEnum.SpkDisbursement,
          amount: '1500000',
          description: 'Pencairan SPK-001',
          referenceType: 'spk',
          referenceId: 'spk-001',
        },
        {
          mutationDate: subDays(new Date(), 12),
          mutationType: CashMutationTypeEnum.Credit,
          category: CashMutationCategoryEnum.NkbPayment,
          amount: '500000',
          description: 'Pembayaran bunga NKB',
          referenceType: 'nkb',
          referenceId: 'nkb-001',
        },
        {
          mutationDate: subDays(new Date(), 10),
          mutationType: CashMutationTypeEnum.Credit,
          category: CashMutationCategoryEnum.Deposit,
          amount: '5000000',
          description: 'Setor uang dari toko',
          referenceType: 'cash_deposit',
          referenceId: 'cd-001',
        },
        {
          mutationDate: subDays(new Date(), 7),
          mutationType: CashMutationTypeEnum.Credit,
          category: CashMutationCategoryEnum.Topup,
          amount: '10000000',
          description: 'Tambah modal dari PT',
          referenceType: 'capital_topup',
          referenceId: 'ct-001',
        },
        {
          mutationDate: subDays(new Date(), 5),
          mutationType: CashMutationTypeEnum.Debit,
          category: CashMutationCategoryEnum.SpkDisbursement,
          amount: '2000000',
          description: 'Pencairan SPK-002',
          referenceType: 'spk',
          referenceId: 'spk-002',
        },
        {
          mutationDate: subDays(new Date(), 3),
          mutationType: CashMutationTypeEnum.Debit,
          category: CashMutationCategoryEnum.Expense,
          amount: '250000',
          description: 'Biaya operasional',
          referenceType: 'expense',
        },
        {
          mutationDate: subDays(new Date(), 1),
          mutationType: CashMutationTypeEnum.Credit,
          category: CashMutationCategoryEnum.NkbPayment,
          amount: '750000',
          description: 'Pelunasan SPK',
          referenceType: 'nkb',
          referenceId: 'nkb-002',
        },
      ];

      for (const m of mutations) {
        const balanceBefore = balance.toString();
        const amountNum = parseFloat(m.amount);
        let balanceAfter: number;
        if (m.mutationType === CashMutationTypeEnum.Credit || m.mutationType === CashMutationTypeEnum.Adjustment) {
          balanceAfter = balance + amountNum;
        } else {
          balanceAfter = balance - amountNum;
        }
        balance = balanceAfter;

        await mutationFactory.create({
          ptId,
          storeId: branch.uuid,
          mutationDate: m.mutationDate,
          mutationType: m.mutationType,
          category: m.category,
          amount: m.amount,
          balanceBefore,
          balanceAfter: balanceAfter.toString(),
          description: m.description,
          referenceType: m.referenceType ?? null,
          referenceId: m.referenceId ?? null,
          createdBy: creator.uuid,
        });
        totalCreated++;
      }
    }

    console.log(`\n📊 Seeded ${totalCreated} cash mutations across ${branches.length} branches`);
  }
}
