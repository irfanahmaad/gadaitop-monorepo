import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { NkbPaymentTypeEnum } from '../../constants/nkb-payment-type';
import { NkbStatusEnum } from '../../constants/nkb-status';
import { SpkStatusEnum } from '../../constants/spk-status';
import { CashMutationService } from '../cash-mutation/cash-mutation.service';
import { BranchEntity } from '../branch/entities/branch.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import {
  InterestCalculatorService,
  type SpkForCalculation,
} from '../spk/services/interest-calculator.service';
import { NkbRecordEntity } from './entities/nkb-record.entity';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { NkbDto } from './dto/nkb.dto';
import { QueryNkbDto } from './dto/query-nkb.dto';
import { CreateNkbDto } from './dto/create-nkb.dto';
import { RejectNkbDto } from './dto/reject-nkb.dto';

@Injectable()
export class NkbService {
  constructor(
    @InjectRepository(NkbRecordEntity)
    private nkbRepository: Repository<NkbRecordEntity>,
    @InjectRepository(SpkRecordEntity)
    private spkRepository: Repository<SpkRecordEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    private interestCalculator: InterestCalculatorService,
    private cashMutationService: CashMutationService,
  ) {}

  async findAll(
    queryDto: QueryNkbDto,
    userPtId?: string,
    userBranchId?: string,
  ): Promise<{ data: NkbDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<NkbRecordEntity> = {};

    if (queryDto.spkId) {
      where.spkId = queryDto.spkId;
    }
    if (queryDto.statusIn) {
      const statuses = queryDto.statusIn
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as NkbStatusEnum[];
      if (statuses.length > 0) {
        where.status = statuses.length === 1 ? statuses[0] : (statuses as any);
      }
    } else if (queryDto.status) {
      where.status = queryDto.status;
    }
    if (queryDto.paymentType) {
      where.paymentType = queryDto.paymentType;
    }

    const qbOptions: QueryBuilderOptionsType<NkbRecordEntity> = {
      ...queryDto,
      select: {
        nkbNumber: true,
        amountPaid: true,
        paymentType: true,
        paymentMethod: true,
        status: true,
        spk: {
          id: true,
          spkNumber: true,
          customer: {
            id: true,
            name: true,
          },
        },
      } as any,
      relation: {
        spk: {
          customer: true,
        },
      } as any,
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        createdAt: { createdAt: true },
        nkbNumber: { nkbNumber: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    // Apply PT/store scope. For older NKB rows where ptId/storeId may be null,
    // fall back to the related SPK scope to keep them visible.
    const qb = NkbRecordEntity.createQueryBuilder('nkb');
    qb.leftJoin('nkb.spk', 'spk_scope');
    if (userPtId) {
      qb.andWhere(
        '(nkb.ptId = :userPtId OR (nkb.ptId IS NULL AND spk_scope.ptId = :userPtId))',
        { userPtId },
      );
    }
    if (queryDto.ptId) {
      qb.andWhere(
        '(nkb.ptId = :queryPtId OR (nkb.ptId IS NULL AND spk_scope.ptId = :queryPtId))',
        { queryPtId: queryDto.ptId },
      );
    }
    if (queryDto.branchId) {
      qb.andWhere(
        '(nkb.storeId = :queryStoreId OR (nkb.storeId IS NULL AND spk_scope.storeId = :queryStoreId))',
        { queryStoreId: queryDto.branchId },
      );
    }
    if (userBranchId) {
      qb.andWhere(
        '(nkb.storeId = :userStoreId OR (nkb.storeId IS NULL AND spk_scope.storeId = :userStoreId))',
        { userStoreId: userBranchId },
      );
    }
    if (queryDto.dateFrom) {
      qb.andWhere('nkb.createdAt >= :dateFrom', {
        dateFrom: new Date(queryDto.dateFrom),
      });
    }
    if (queryDto.dateTo) {
      const dateToEnd = new Date(queryDto.dateTo);
      dateToEnd.setHours(23, 59, 59, 999);
      qb.andWhere('nkb.createdAt <= :dateTo', { dateTo: dateToEnd });
    }

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.nkbRepository.metadata);
    const [records, count] = await dynamicQueryBuilder.buildDynamicQuery(
      qb,
      qbOptions,
    );
    const data = records.map((r) => new NkbDto(r));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string): Promise<NkbDto> {
    const record = await this.nkbRepository.findOne({
      where: { uuid },
      relations: ['spk', 'spk.customer', 'spk.store', 'spk.pt'],
    });
    if (!record) {
      throw new NotFoundException(`NKB with UUID ${uuid} not found`);
    }
    return new NkbDto(record);
  }

  async findOneForCustomer(uuid: string, customerId: string): Promise<NkbDto> {
    const record = await this.nkbRepository.findOne({
      where: { uuid },
      relations: ['spk', 'spk.customer', 'spk.store', 'spk.pt'],
    });
    if (!record) {
      throw new NotFoundException(`NKB with UUID ${uuid} not found`);
    }
    if (record.spk?.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this NKB');
    }
    return new NkbDto(record);
  }

  async create(createDto: CreateNkbDto, createdBy: string | null): Promise<NkbDto> {
    const spk = await this.spkRepository.findOne({
      where: { uuid: createDto.spkId },
    });
    if (!spk) {
      throw new NotFoundException('SPK not found');
    }
    if (
      spk.status !== SpkStatusEnum.Active &&
      spk.status !== SpkStatusEnum.Extended &&
      spk.status !== SpkStatusEnum.Overdue
    ) {
      throw new BadRequestException(
        'NKB can only be created for active, extended, or overdue SPK',
      );
    }
    const nkbNumber = await this.generateNkbNumber(createDto.storeId);
    const nkb = this.nkbRepository.create({
      nkbNumber,
      ptId: createDto.ptId,
      storeId: createDto.storeId,
      spkId: createDto.spkId,
      amountPaid: String(createDto.amountPaid),
      paymentType: createDto.paymentType,
      paymentMethod: createDto.paymentMethod,
      status: NkbStatusEnum.Pending,
      createdBy,
      isCustomerInitiated: !createdBy,
    });
    const saved = await this.nkbRepository.save(nkb);
    return this.findOne(saved.uuid);
  }

  async confirm(uuid: string, confirmedBy: string): Promise<NkbDto> {
    const nkb = await this.nkbRepository.findOne({
      where: { uuid },
      relations: ['spk'],
    });
    if (!nkb) {
      throw new NotFoundException(`NKB with UUID ${uuid} not found`);
    }
    if (nkb.status !== NkbStatusEnum.Pending) {
      throw new BadRequestException('Only pending NKB can be confirmed');
    }
    nkb.status = NkbStatusEnum.Confirmed;
    nkb.confirmedBy = confirmedBy;
    nkb.confirmedAt = new Date();
    await this.nkbRepository.save(nkb);

    const spk = await this.spkRepository.findOne({
      where: { uuid: nkb.spkId },
    });
    if (spk) {
      const amountPaid = Number(nkb.amountPaid);
      const company = await this.companyRepository.findOne({
        where: { uuid: spk.ptId },
      });
      const config = company
        ? {
            earlyInterestRate: Number(company.earlyInterestRate ?? 5),
            normalInterestRate: Number(company.normalInterestRate ?? 10),
            adminFeeRate: Number(company.adminFeeRate ?? 0),
            insuranceFee: Number(company.insuranceFee ?? 0),
            latePenaltyRate: Number(company.latePenaltyRate ?? 2),
            minPrincipalPayment: Number(company.minPrincipalPayment ?? 50000),
            earlyPaymentDays: Number(company.earlyPaymentDays ?? 15),
          }
        : null;

      if (nkb.paymentType === NkbPaymentTypeEnum.FullRedemption) {
        spk.remainingBalance = '0';
        spk.status = SpkStatusEnum.Redeemed;
      } else if (
        nkb.paymentType === NkbPaymentTypeEnum.Renewal &&
        config
      ) {
        const spkForCalc: SpkForCalculation = {
          principalAmount: Number(spk.principalAmount),
          tenor: spk.tenor,
          interestRate: Number(spk.interestRate),
          adminFee: Number(spk.adminFee ?? 0),
          totalAmount: Number(spk.totalAmount),
          remainingBalance: Number(spk.remainingBalance),
          dueDate: spk.dueDate,
          ...(spk as any),
        };
        const paymentDate = new Date();
        const extResult = this.interestCalculator.calculateExtension(
          spkForCalc,
          paymentDate,
          amountPaid,
          config,
        );
        spk.remainingBalance = String(extResult.newRemainingBalance);
        spk.dueDate = extResult.newDueDate;
        spk.status = SpkStatusEnum.Extended;
      } else {
        const remaining = Number(spk.remainingBalance) - amountPaid;
        spk.remainingBalance = String(Math.max(0, remaining));
        if (remaining <= 0) {
          spk.status = SpkStatusEnum.Redeemed;
        } else if (
          nkb.paymentType === NkbPaymentTypeEnum.Renewal &&
          (spk.status === SpkStatusEnum.Active ||
            spk.status === SpkStatusEnum.Extended ||
            spk.status === SpkStatusEnum.Overdue)
        ) {
          spk.status = SpkStatusEnum.Extended;
        }
      }
      await this.spkRepository.save(spk);

      const ptId = nkb.ptId ?? spk.ptId;
      const storeId = nkb.storeId ?? spk.storeId;
      if (ptId && storeId) {
        await this.cashMutationService.createFromNkbPayment(
          ptId,
          storeId,
          Number(nkb.amountPaid),
          nkb.uuid,
          confirmedBy,
        );
      }
    }

    return this.findOne(uuid);
  }

  async reject(uuid: string, dto: RejectNkbDto, rejectedBy: string): Promise<NkbDto> {
    const nkb = await this.nkbRepository.findOne({
      where: { uuid },
    });
    if (!nkb) {
      throw new NotFoundException(`NKB with UUID ${uuid} not found`);
    }
    if (nkb.status !== NkbStatusEnum.Pending) {
      throw new BadRequestException('Only pending NKB can be rejected');
    }
    nkb.status = NkbStatusEnum.Rejected;
    nkb.rejectionReason = dto.reason ?? null;
    nkb.confirmedBy = rejectedBy;
    nkb.confirmedAt = new Date();
    await this.nkbRepository.save(nkb);
    return this.findOne(uuid);
  }

  private async generateNkbNumber(storeId: string): Promise<string> {
    const store = await this.branchRepository.findOne({
      where: { uuid: storeId },
      select: ['branchCode'],
    });
    const locationCode = store?.branchCode ?? 'LOC';
    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    let candidate = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 100) {
      const random = Math.floor(1000 + Math.random() * 9000);
      candidate = `${locationCode}-NKB-${datePart}-${random}`;
      const found = await this.nkbRepository.findOne({
        where: { nkbNumber: candidate },
      });
      exists = !!found;
      attempts++;
    }
    if (exists || !candidate) {
      throw new BadRequestException('Could not generate unique NKB number');
    }
    return candidate;
  }
}
