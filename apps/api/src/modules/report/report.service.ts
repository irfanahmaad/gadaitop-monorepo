import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { CashMutationService } from '../cash-mutation/cash-mutation.service';
import { CashMutationEntity } from '../cash-mutation/entities/cash-mutation.entity';
import { CashMutationDto } from '../cash-mutation/dto/cash-mutation.dto';
import { BranchEntity } from '../branch/entities/branch.entity';
import { SpkService } from '../spk/spk.service';
import { NkbService } from '../nkb/nkb.service';
import { StockOpnameService } from '../stock-opname/stock-opname.service';
import { QueryReportDto } from './dto/query-report.dto';

@Injectable()
export class ReportService {
  constructor(
    private cashMutationService: CashMutationService,
    @InjectRepository(CashMutationEntity)
    private cashMutationRepository: Repository<CashMutationEntity>,
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    private spkService: SpkService,
    private nkbService: NkbService,
    private stockOpnameService: StockOpnameService,
  ) {}

  async getMutationByBranch(
    queryDto: QueryReportDto,
    userPtId?: string,
  ) {
    const cashQuery = {
      ...queryDto,
      storeId: queryDto.storeId,
      dateFrom: queryDto.dateFrom,
      dateTo: queryDto.dateTo,
    } as any;
    return this.cashMutationService.findAll(cashQuery, queryDto.storeId);
  }

  async getMutationByPt(
    queryDto: QueryReportDto,
    userPtId?: string,
  ): Promise<{ data: CashMutationDto[]; meta: PageMetaDto }> {
    const ptId = queryDto.ptId ?? userPtId;
    const branches = ptId
      ? await this.branchRepository.find({ where: { companyId: ptId }, select: ['uuid'] })
      : await this.branchRepository.find({ select: ['uuid'] });
    const storeIds = branches.map((b) => b.uuid);
    if (!storeIds.length) {
      return { data: [], meta: new PageMetaDto({ pageOptionsDto: queryDto, itemCount: 0 }) };
    }
    const qb = this.cashMutationRepository
      .createQueryBuilder('m')
      .where('m.storeId IN (:...storeIds)', { storeIds });
    if (queryDto.dateFrom) {
      qb.andWhere('m.mutationDate >= :dateFrom', { dateFrom: queryDto.dateFrom });
    }
    if (queryDto.dateTo) {
      qb.andWhere('m.mutationDate <= :dateTo', { dateTo: queryDto.dateTo });
    }
    qb.orderBy('m.mutationDate', 'DESC').addOrderBy('m.id', 'DESC');
    qb.skip(queryDto.getSkip());
    const take = queryDto.getTake();
    if (take !== undefined) qb.take(take);
    const [records, count] = await qb.getManyAndCount();
    const data = records.map((r) => new CashMutationDto(r));
    const meta = new PageMetaDto({ pageOptionsDto: queryDto, itemCount: count });
    return { data, meta };
  }

  async getSpkReport(
    queryDto: QueryReportDto,
    userPtId?: string,
  ) {
    const spkQuery = {
      ...queryDto,
      ptId: queryDto.ptId,
      branchId: queryDto.storeId,
      dateFrom: queryDto.dateFrom,
      dateTo: queryDto.dateTo,
    } as any;
    return this.spkService.findAll(spkQuery, userPtId);
  }

  async getNkbPaymentsReport(
    queryDto: QueryReportDto,
    userPtId?: string,
  ) {
    const nkbQuery = {
      ...queryDto,
      ptId: queryDto.ptId,
      branchId: queryDto.storeId,
      dateFrom: queryDto.dateFrom,
      dateTo: queryDto.dateTo,
    } as any;
    return this.nkbService.findAll(nkbQuery, userPtId);
  }

  async getStockOpnameReport(
    queryDto: QueryReportDto,
    userPtId?: string,
  ) {
    const soQuery = {
      ...queryDto,
      ptId: queryDto.ptId,
      storeId: queryDto.storeId,
    } as any;
    return this.stockOpnameService.findAll(soQuery, userPtId);
  }

  /**
   * Convert array of objects to CSV string (simple implementation).
   */
  toCsv<T extends Record<string, unknown>>(rows: T[], columns?: (keyof T)[]): string {
    if (!rows.length) return '';
    const keys = columns ?? (Object.keys(rows[0]) as (keyof T)[]);
    const header = keys.join(',');
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const lines = rows.map((row) => keys.map((k) => escape(row[k])).join(','));
    return [header, ...lines].join('\n');
  }
}
