import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';

import { SpkStatusEnum } from '../../constants/spk-status';
import { CashMutationTypeEnum } from '../../constants/cash-mutation-type';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { NkbRecordEntity } from '../nkb/entities/nkb-record.entity';
import { CashMutationEntity } from '../cash-mutation/entities/cash-mutation.entity';
import { BranchEntity } from '../branch/entities/branch.entity';
import { DashboardKpisDto } from './dto/kpis.dto';
import { SpkByStatusDto } from './dto/spk-by-status.dto';
import { MutationTrendsDto } from './dto/mutation-trends.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(SpkRecordEntity)
    private spkRepository: Repository<SpkRecordEntity>,
    @InjectRepository(NkbRecordEntity)
    private nkbRepository: Repository<NkbRecordEntity>,
    @InjectRepository(CashMutationEntity)
    private cashMutationRepository: Repository<CashMutationEntity>,
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
  ) {}

  async getKpis(ptId?: string, branchId?: string): Promise<DashboardKpisDto> {
    const storeIds = branchId
      ? [branchId]
      : ptId
        ? await this.getStoreIdsByPtId(ptId)
        : await this.getAllStoreIds();

    const [activeSpkCount, overdueSpkCount, nkbCountThisMonth] = await Promise.all([
      this.spkRepository.count({
        where: {
          status: In([SpkStatusEnum.Active, SpkStatusEnum.Extended]),
          ...(storeIds.length ? { storeId: In(storeIds) } : {}),
        },
      }),
      this.spkRepository.count({
        where: {
          status: SpkStatusEnum.Overdue,
          ...(storeIds.length ? { storeId: In(storeIds) } : {}),
        },
      }),
      this.getNkbCountThisMonth(storeIds),
    ]);

    const balanceByStore: Record<string, number> = {};
    let totalBalance = 0;
    for (const storeId of storeIds) {
      const balance = await this.getStoreBalance(storeId);
      balanceByStore[storeId] = balance;
      totalBalance += balance;
    }

    return {
      activeSpkCount,
      overdueSpkCount,
      nkbCountThisMonth,
      balanceByStore,
      totalBalance,
    };
  }

  async getSpkByStatus(ptId?: string, branchId?: string): Promise<SpkByStatusDto[]> {
    const storeIds = branchId
      ? [branchId]
      : ptId
        ? await this.getStoreIdsByPtId(ptId)
        : await this.getAllStoreIds();

    const qb = this.spkRepository
      .createQueryBuilder('spk')
      .select('spk.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('spk.status');
    if (storeIds.length) {
      qb.andWhere('spk.storeId IN (:...storeIds)', { storeIds });
    }
    const raw = await qb.getRawMany<{ status: string; count: string }>();
    return raw.map((r) => ({ status: r.status, count: parseInt(r.count, 10) }));
  }

  async getMutationTrends(
    ptId?: string,
    branchId?: string,
    days: number = 30,
    date?: string,
  ): Promise<MutationTrendsDto[]> {
    const storeIds = branchId
      ? [branchId]
      : ptId
        ? await this.getStoreIdsByPtId(ptId)
        : await this.getAllStoreIds();

    if (!storeIds.length) {
      return [];
    }

    const end = date ? new Date(date) : new Date();
    const start = date ? new Date(date) : new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const mutations = await this.cashMutationRepository.find({
      where: {
        storeId: In(storeIds),
        mutationDate: Between(start, end),
      },
      order: { mutationDate: 'ASC' },
    });

    const byDate = new Map<string, { credit: number; debit: number }>();
    for (const m of mutations) {
      const key = m.mutationDate instanceof Date
        ? m.mutationDate.toISOString().slice(0, 10)
        : String(m.mutationDate).slice(0, 10);
      const entry = byDate.get(key) ?? { credit: 0, debit: 0 };
      const amount = Number(m.amount);
      if (m.mutationType === CashMutationTypeEnum.Credit) {
        entry.credit += amount;
      } else {
        entry.debit += amount;
      }
      byDate.set(key, entry);
    }

    const result: MutationTrendsDto[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const entry = byDate.get(key) ?? { credit: 0, debit: 0 };
      result.push({
        date: key,
        creditTotal: entry.credit,
        debitTotal: entry.debit,
        net: entry.credit - entry.debit,
      });
    }
    return result;
  }

  private async getStoreIdsByPtId(ptId: string): Promise<string[]> {
    const branches = await this.branchRepository.find({
      where: { companyId: ptId },
      select: ['uuid'],
    });
    return branches.map((b) => b.uuid);
  }

  private async getAllStoreIds(): Promise<string[]> {
    const branches = await this.branchRepository.find({
      select: ['uuid'],
    });
    return branches.map((b) => b.uuid);
  }

  private async getNkbCountThisMonth(storeIds: string[]): Promise<number> {
    if (!storeIds.length) {
      return this.nkbRepository
        .createQueryBuilder('nkb')
        .innerJoin('nkb.spk', 'spk')
        .where('nkb.createdAt >= :start', {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        })
        .getCount();
    }
    return this.nkbRepository
      .createQueryBuilder('nkb')
      .innerJoin('nkb.spk', 'spk')
      .where('spk.storeId IN (:...storeIds)', { storeIds })
      .andWhere('nkb.createdAt >= :start', {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      })
      .getCount();
  }

  private async getStoreBalance(storeId: string): Promise<number> {
    const latest = await this.cashMutationRepository.findOne({
      where: { storeId },
      order: { mutationDate: 'DESC', id: 'DESC' },
    });
    return latest ? Number(latest.balanceAfter) : 0;
  }
}
