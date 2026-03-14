import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  type FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { validateHash } from '../../common/utils';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { SpkItemConditionEnum } from '../../constants/spk-item-condition';
import { SpkItemStatusEnum } from '../../constants/spk-item-status';
import { SpkStatusEnum } from '../../constants/spk-status';
import { NkbPaymentMethodEnum } from '../../constants/nkb-payment-method';
import { NkbPaymentTypeEnum } from '../../constants/nkb-payment-type';
import { NkbStatusEnum } from '../../constants/nkb-status';
import { AuctionBatchItemEntity } from '../auction/entities/auction-batch-item.entity';
import { CashMutationService } from '../cash-mutation/cash-mutation.service';
import { BranchEntity } from '../branch/entities/branch.entity';
import { CompanyEntity } from '../company/entities/company.entity';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { ItemTypeEntity } from '../item-type/entities/item-type.entity';
import { NkbRecordEntity } from '../nkb/entities/nkb-record.entity';
import { SpkRecordEntity } from './entities/spk-record.entity';
import { SpkItemEntity } from './entities/spk-item.entity';
import { SpkDto } from './dto/spk.dto';
import { CreateSpkDto } from './dto/create-spk.dto';
import { QuerySpkDto } from './dto/query-spk.dto';
import { ConfirmSpkDto } from './dto/confirm-spk.dto';
import { ExtendSpkDto } from './dto/extend-spk.dto';
import { RedeemSpkDto } from './dto/redeem-spk.dto';
import {
  CompanyInterestConfig,
  InterestCalculatorService,
  type SpkForCalculation,
} from './services/interest-calculator.service';

@Injectable()
export class SpkService {
  constructor(
    @InjectRepository(SpkRecordEntity)
    private spkRepository: Repository<SpkRecordEntity>,
    @InjectRepository(SpkItemEntity)
    private spkItemRepository: Repository<SpkItemEntity>,
    @InjectRepository(NkbRecordEntity)
    private nkbRepository: Repository<NkbRecordEntity>,
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
    @InjectRepository(ItemTypeEntity)
    private itemTypeRepository: Repository<ItemTypeEntity>,
    @InjectRepository(AuctionBatchItemEntity)
    private batchItemRepository: Repository<AuctionBatchItemEntity>,
    private interestCalculator: InterestCalculatorService,
    private cashMutationService: CashMutationService,
    private dataSource: DataSource,
  ) {}

  async findAll(
    queryDto: QuerySpkDto,
    userPtId?: string,
  ): Promise<{ data: SpkDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<SpkRecordEntity> = {};

    if (userPtId) {
      where.ptId = userPtId;
    }
    if (queryDto.ptId) {
      where.ptId = queryDto.ptId;
    }
    if (queryDto.branchId) {
      where.storeId = queryDto.branchId;
    }
    if (queryDto.customerId) {
      where.customerId = queryDto.customerId;
    }
    if (queryDto.status) {
      where.status = queryDto.status;
    }
    if (queryDto.dateFrom || queryDto.dateTo) {
      if (queryDto.dateFrom && queryDto.dateTo) {
        const dateToEnd = new Date(queryDto.dateTo);
        dateToEnd.setHours(23, 59, 59, 999);
        where.createdAt = Between(
          new Date(queryDto.dateFrom),
          dateToEnd,
        ) as any;
      } else if (queryDto.dateFrom) {
        where.createdAt = MoreThanOrEqual(new Date(queryDto.dateFrom)) as any;
      } else {
        const dateToEnd = new Date(queryDto.dateTo!);
        dateToEnd.setHours(23, 59, 59, 999);
        where.createdAt = LessThanOrEqual(dateToEnd) as any;
      }
    }

    const isOverdue = queryDto.status === SpkStatusEnum.Overdue;
    const isCustomerScoped = !!queryDto.customerId;
    const qbOptions: QueryBuilderOptionsType<SpkRecordEntity> = {
      ...queryDto,
      // When loading overdue SPKs we need items + itemType; a restrictive select
      // would override leftJoinAndSelect and leave items empty, so omit select.
      // Similarly, when the query is scoped by customerId (customer portal),
      // we omit select so we can load related entities (items, store, pt) fully.
      ...(!isOverdue &&
        !isCustomerScoped && {
          select: {
            spkNumber: true,
            internalSpkNumber: true,
            customerSpkNumber: true,
            principalAmount: true,
            tenor: true,
            interestRate: true,
            totalAmount: true,
            remainingBalance: true,
            dueDate: true,
            status: true,
            customer: {
              id: true,
              uuid: true,
              name: true,
              nik: true,
            },
            store: {
              id: true,
              uuid: true,
              shortName: true,
              branchCode: true,
            },
            pt: {
              id: true,
              uuid: true,
              companyName: true,
            },
          } as any,
        }),
      relation: {
        customer: true,
        store: true,
        pt: true,
        ...(isOverdue && {
          items: { itemType: true },
          creator: true,
        }),
        // For customer-scoped queries (customer portal), always load items so
        // the frontend can display Nama Item from the first item's description.
        ...(isCustomerScoped && !isOverdue && {
          items: true,
        }),
      },
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        createdAt: { createdAt: true },
        spkNumber: { spkNumber: true },
        dueDate: { dueDate: true },
        status: { status: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.spkRepository.metadata);
    const [records, count] = await dynamicQueryBuilder.buildDynamicQuery(
      SpkRecordEntity.createQueryBuilder('spk'),
      qbOptions,
    );

    let data = records.map((r) => new SpkDto(r));
    if (isOverdue && queryDto.excludeInAuctionBatch) {
      const batchItems = await this.batchItemRepository
        .createQueryBuilder('abi')
        .innerJoin('abi.batch', 'b')
        .where('b.status != :cancelled', { cancelled: 'cancelled' })
        .select('abi.spkItemId')
        .getMany();
      const spkItemIdsInBatch = new Set(batchItems.map((b) => b.spkItemId));
      data = records.map((r) => {
        const filteredItems = (r.items || []).filter(
          (item: { uuid: string }) => !spkItemIdsInBatch.has(item.uuid),
        );
        return new SpkDto({ ...r, items: filteredItems } as any);
      });
    }

    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string): Promise<SpkDto> {
    const record = await this.spkRepository.findOne({
      where: { uuid },
      relations: ['customer', 'store', 'pt', 'items', 'items.itemType'],
    });
    if (!record) {
      throw new NotFoundException(`SPK with UUID ${uuid} not found`);
    }
    return new SpkDto(record);
  }

  async findOneForCustomer(uuid: string, customerId: string): Promise<SpkDto> {
    const record = await this.spkRepository.findOne({
      where: { uuid, customerId },
      relations: ['customer', 'store', 'pt', 'items', 'items.itemType'],
    });
    if (!record) {
      throw new NotFoundException(`SPK with UUID ${uuid} not found`);
    }
    return new SpkDto(record);
  }

  async create(createDto: CreateSpkDto, createdBy: string): Promise<SpkDto> {
    const customer = await this.customerRepository.findOne({
      where: { uuid: createDto.customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    if (customer.isBlacklisted) {
      throw new BadRequestException('Customer is blacklisted; cannot create SPK');
    }
    if (customer.ptId !== createDto.ptId) {
      throw new BadRequestException('Customer does not belong to this PT');
    }

    const store = await this.branchRepository.findOne({
      where: { uuid: createDto.storeId },
      relations: ['company'],
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    if (store.companyId !== createDto.ptId) {
      throw new BadRequestException('Store does not belong to this PT');
    }

    const company = await this.companyRepository.findOne({
      where: { uuid: createDto.ptId },
    });
    if (!company) {
      throw new NotFoundException('Company (PT) not found');
    }

    if (!createDto.items?.length) {
      throw new BadRequestException('At least one item is required');
    }

    const totalAppraisedValue = createDto.items.reduce(
      (sum, item) => sum + item.appraisedValue,
      0,
    );
    if (createDto.principalAmount > totalAppraisedValue) {
      throw new BadRequestException(
        'Nominal pinjaman tidak boleh melebihi harga acuan barang',
      );
    }

    const itemType = await this.itemTypeRepository.findOne({
      where: { uuid: createDto.items[0].itemTypeId },
    });
    if (!itemType) {
      throw new NotFoundException('Item type not found');
    }

    const interestRate =
      createDto.interestRate ??
      Number(company.normalInterestRate ?? 10);
    const adminFeeAmount =
      createDto.adminFee ?? Number(company.adminFeeRate ?? 0) * createDto.principalAmount * 0.01;
    const principal = createDto.principalAmount;
    const tenor = createDto.tenor;
    const interestAmount = (principal * (interestRate / 100) * tenor) / 30;
    const totalAmount = principal + interestAmount + adminFeeAmount;
    const remainingBalance = totalAmount;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + tenor);

    const customerSpkNumber = await this.generateCustomerSpkNumber();

    return await this.dataSource.transaction(async (manager) => {
      const branchRepo = manager.getRepository(BranchEntity);
      const locked = await branchRepo.findOne({
        where: { uuid: store.uuid },
        lock: { mode: 'pessimistic_write' },
      });
      if (!locked) {
        throw new NotFoundException('Store not found');
      }
      const nextSeq = (locked.transactionSequence ?? 0) + 1;
      const internalSpkNumber = `${itemType.typeCode}${String(nextSeq).padStart(8, '0')}`;
      const spkNumber = internalSpkNumber;

      const spk = manager.create(SpkRecordEntity, {
        spkNumber,
        internalSpkNumber,
        customerSpkNumber,
        customerId: createDto.customerId,
        storeId: createDto.storeId,
        ptId: createDto.ptId,
        principalAmount: String(principal),
        tenor,
        interestRate: String(interestRate),
        adminFee: String(adminFeeAmount),
        totalAmount: String(totalAmount),
        remainingBalance: String(remainingBalance),
        dueDate,
        status: SpkStatusEnum.Draft,
        createdBy,
      });
      const savedSpk = await manager.save(SpkRecordEntity, spk);

      for (const item of createDto.items) {
        const spkItem = manager.create(SpkItemEntity, {
          spkId: savedSpk.uuid,
          catalogId: item.catalogId ?? null,
          itemTypeId: item.itemTypeId,
          description: item.description,
          brand: item.brand ?? null,
          model: item.model ?? null,
          serialNumber: item.serialNumber ?? null,
          appraisedValue: String(item.appraisedValue),
          condition: item.condition ?? SpkItemConditionEnum.Good,
          weight: item.weight != null ? String(item.weight) : null,
          purity: item.purity ?? null,
          evidencePhotos: item.evidencePhotos ?? null,
          storageLocation: item.storageLocation ?? null,
        });
        await manager.save(SpkItemEntity, spkItem);
      }

      await manager.update(
        BranchEntity,
        { uuid: store.uuid },
        { transactionSequence: nextSeq },
      );

      const loaded = await manager.findOne(SpkRecordEntity, {
        where: { uuid: savedSpk.uuid },
        relations: ['customer', 'store', 'pt', 'items', 'items.itemType'],
      });
      return new SpkDto(loaded!);
    });
  }

  async confirm(uuid: string, dto: ConfirmSpkDto): Promise<SpkDto> {
    const spk = await this.spkRepository.findOne({
      where: { uuid },
      relations: ['customer'],
    });
    if (!spk) {
      throw new NotFoundException(`SPK with UUID ${uuid} not found`);
    }
    if (spk.status !== SpkStatusEnum.Draft) {
      throw new BadRequestException('Only draft SPK can be confirmed');
    }
    const valid = await validateHash(dto.pin, spk.customer?.pinHash ?? null);
    if (!valid) {
      throw new BadRequestException('Invalid PIN');
    }
    spk.status = SpkStatusEnum.Active;
    spk.confirmedAt = new Date();
    spk.confirmedByPin = true;
    await this.spkRepository.save(spk);

    await this.cashMutationService.createFromSpkDisbursement(
      spk.ptId,
      spk.storeId,
      Number(spk.principalAmount),
      spk.uuid,
      spk.createdBy ?? '',
    );

    return this.findOne(uuid);
  }

  async extend(
    uuid: string,
    dto: ExtendSpkDto,
    createdBy: string | null,
  ): Promise<{ nkbNumber: string; nkbId: string }> {
    const spk = await this.spkRepository.findOne({
      where: { uuid },
      relations: ['pt'],
    });
    if (!spk) {
      throw new NotFoundException(`SPK with UUID ${uuid} not found`);
    }
    if (
      spk.status !== SpkStatusEnum.Active &&
      spk.status !== SpkStatusEnum.Extended &&
      spk.status !== SpkStatusEnum.Overdue
    ) {
      throw new BadRequestException(
        'Only active, extended, or overdue SPK can request extension',
      );
    }

    const existingPendingNkb = await this.findPendingNkb(spk.uuid);
    if (existingPendingNkb) {
      return {
        nkbNumber: existingPendingNkb.nkbNumber,
        nkbId: existingPendingNkb.uuid,
      };
    }

    const company = await this.companyRepository.findOne({
      where: { uuid: spk.ptId },
    });
    if (!company) {
      throw new NotFoundException('Company (PT) not found');
    }
    const config = this.buildCompanyConfig(company);
    const spkForCalc = this.buildSpkForCalculation(spk);
    const paymentDate = new Date();
    const extResult = this.interestCalculator.calculateExtension(
      spkForCalc,
      paymentDate,
      dto.amountPaid,
      config,
    );
    const minTotal = extResult.interestAmount + extResult.latePenalty + config.minPrincipalPayment;
    if (dto.amountPaid < minTotal) {
      throw new BadRequestException(
        `Minimum payment for renewal: Rp ${Math.ceil(minTotal).toLocaleString('id-ID')} ` +
          `(bunga + denda + pokok min. Rp ${config.minPrincipalPayment.toLocaleString('id-ID')})`,
      );
    }

    const nkbNumber = await this.generateNkbNumber(spk.storeId);
    const paymentMethod = dto.paymentMethod ?? NkbPaymentMethodEnum.Cash;
    const nkb = this.nkbRepository.create({
      nkbNumber,
      ptId: spk.ptId,
      storeId: spk.storeId,
      spkId: spk.uuid,
      amountPaid: String(dto.amountPaid),
      paymentType: NkbPaymentTypeEnum.Renewal,
      paymentMethod,
      status: NkbStatusEnum.Pending,
      createdBy,
      isCustomerInitiated: !createdBy,
    });
    const saved = await this.nkbRepository.save(nkb);
    return { nkbNumber, nkbId: saved.uuid };
  }

  async redeem(
    uuid: string,
    dto: RedeemSpkDto,
    createdBy: string | null,
  ): Promise<{ nkbNumber: string; nkbId: string }> {
    const spk = await this.spkRepository.findOne({
      where: { uuid },
      relations: ['pt'],
    });
    if (!spk) {
      throw new NotFoundException(`SPK with UUID ${uuid} not found`);
    }
    if (
      spk.status !== SpkStatusEnum.Active &&
      spk.status !== SpkStatusEnum.Extended &&
      spk.status !== SpkStatusEnum.Overdue
    ) {
      throw new BadRequestException(
        'Only active, extended, or overdue SPK can be redeemed',
      );
    }

    const existingPendingNkb = await this.findPendingNkb(spk.uuid);
    if (existingPendingNkb) {
      return {
        nkbNumber: existingPendingNkb.nkbNumber,
        nkbId: existingPendingNkb.uuid,
      };
    }

    const amount =
      dto.amountPaid ?? Number(spk.remainingBalance);
    const company = await this.companyRepository.findOne({
      where: { uuid: spk.ptId },
    });
    if (!company) {
      throw new NotFoundException('Company (PT) not found');
    }
    const config = this.buildCompanyConfig(company);
    const spkForCalc = this.buildSpkForCalculation(spk);
    const paymentDate = new Date();
    const redemptionResult = this.interestCalculator.calculateFullRedemption(
      spkForCalc,
      paymentDate,
      config,
    );
    if (amount < redemptionResult.totalDue) {
      throw new BadRequestException(
        `Minimum payment for full redemption: Rp ${Math.ceil(redemptionResult.totalDue).toLocaleString('id-ID')} ` +
          `(pokok + bunga + admin + denda)`,
      );
    }
    const paymentMethod = dto.paymentMethod ?? NkbPaymentMethodEnum.Cash;
    const nkbNumber = await this.generateNkbNumber(spk.storeId);
    const nkb = this.nkbRepository.create({
      nkbNumber,
      ptId: spk.ptId,
      storeId: spk.storeId,
      spkId: spk.uuid,
      amountPaid: String(amount),
      paymentType: NkbPaymentTypeEnum.FullRedemption,
      paymentMethod,
      status: NkbStatusEnum.Pending,
      createdBy,
      isCustomerInitiated: !createdBy,
    });
    const saved = await this.nkbRepository.save(nkb);
    return { nkbNumber, nkbId: saved.uuid };
  }

  async calculatePayment(
    uuid: string,
    type: 'renewal' | 'redemption',
    amountPaid?: number,
  ): Promise<{
    interestAmount: number;
    latePenalty: number;
    adminFeeAmount?: number;
    principalPaid: number;
    newRemainingBalance?: number;
    newDueDate?: string;
    totalDue?: number;
  }> {
    const spk = await this.spkRepository.findOne({
      where: { uuid },
      relations: ['pt'],
    });
    if (!spk) {
      throw new NotFoundException(`SPK with UUID ${uuid} not found`);
    }
    const company = await this.companyRepository.findOne({
      where: { uuid: spk.ptId },
    });
    if (!company) {
      throw new NotFoundException('Company (PT) not found');
    }
    const config = this.buildCompanyConfig(company);
    const spkForCalc = this.buildSpkForCalculation(spk);
    const paymentDate = new Date();

    if (type === 'redemption') {
      const result = this.interestCalculator.calculateFullRedemption(
        spkForCalc,
        paymentDate,
        config,
      );
      return {
        interestAmount: result.interestAmount,
        latePenalty: result.latePenalty,
        adminFeeAmount: result.adminFeeAmount,
        principalPaid: result.principalPaid,
        totalDue: result.totalDue,
      };
    }

    const amt = amountPaid ?? Number(spk.remainingBalance);
    const result = this.interestCalculator.calculateExtension(
      spkForCalc,
      paymentDate,
      amt,
      config,
    );
    return {
      interestAmount: result.interestAmount,
      latePenalty: result.latePenalty,
      principalPaid: result.principalPaid,
      newRemainingBalance: result.newRemainingBalance,
      newDueDate: result.newDueDate.toISOString().slice(0, 10),
    };
  }

  async getHistory(uuid: string): Promise<unknown[]> {
    await this.findOne(uuid);
    return [];
  }

  async getNkb(uuid: string): Promise<unknown[]> {
    await this.findOne(uuid);
    const list = await this.nkbRepository.find({
      where: { spkId: uuid },
      order: { createdAt: 'DESC' },
    });
    return list.map((n) => ({
      uuid: n.uuid,
      nkbNumber: n.nkbNumber,
      amountPaid: n.amountPaid,
      paymentType: n.paymentType,
      status: n.status,
      createdAt: n.createdAt,
    }));
  }

  private buildCompanyConfig(company: CompanyEntity): CompanyInterestConfig {
    return {
      earlyInterestRate: Number(company.earlyInterestRate ?? 5),
      normalInterestRate: Number(company.normalInterestRate ?? 10),
      adminFeeRate: Number(company.adminFeeRate ?? 0),
      insuranceFee: Number(company.insuranceFee ?? 0),
      latePenaltyRate: Number(company.latePenaltyRate ?? 2),
      minPrincipalPayment: Number(company.minPrincipalPayment ?? 50000),
      earlyPaymentDays: Number(company.earlyPaymentDays ?? 15),
    };
  }

  private buildSpkForCalculation(spk: SpkRecordEntity): SpkForCalculation {
    return {
      principalAmount: Number(spk.principalAmount),
      tenor: spk.tenor,
      interestRate: Number(spk.interestRate),
      adminFee: Number(spk.adminFee ?? 0),
      totalAmount: Number(spk.totalAmount),
      remainingBalance: Number(spk.remainingBalance),
      dueDate: spk.dueDate,
      ...(spk as any),
    };
  }

  private async generateCustomerSpkNumber(): Promise<string> {
    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    let candidate = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 100) {
      const random = Math.floor(1000 + Math.random() * 9000);
      candidate = `${datePart}${random}`;
      const found = await this.spkRepository.findOne({
        where: { customerSpkNumber: candidate },
      });
      exists = !!found;
      attempts++;
    }
    if (exists || !candidate) {
      throw new BadRequestException(
        'Could not generate unique customer SPK number',
      );
    }
    return candidate;
  }

  private async findPendingNkb(
    spkId: string,
  ): Promise<Pick<NkbRecordEntity, 'uuid' | 'nkbNumber'> | null> {
    const pendingNkb = await this.nkbRepository.findOne({
      select: {
        uuid: true,
        nkbNumber: true,
      },
      where: {
        spkId,
        status: NkbStatusEnum.Pending,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!pendingNkb) {
      return null;
    }

    return {
      uuid: pendingNkb.uuid,
      nkbNumber: pendingNkb.nkbNumber,
    };
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
    let candidate: string;
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
    if (exists) {
      throw new BadRequestException('Could not generate unique NKB number');
    }
    return candidate!;
  }

  /**
   * Find SPK items by UUIDs with SPK relation (for auction batch validation).
   */
  async findSpkItemsByIdsWithSpk(
    itemIds: string[],
  ): Promise<SpkItemEntity[]> {
    if (itemIds.length === 0) return [];
    return this.spkItemRepository.find({
      where: { uuid: In(itemIds) },
      relations: ['spk'],
    });
  }

  /**
   * Set SPK item status to InAuction for given item UUIDs (bulk update).
   */
  async markSpkItemsAsInAuction(itemIds: string[]): Promise<void> {
    if (itemIds.length === 0) return;
    await this.spkItemRepository.update(
      { uuid: In(itemIds) },
      { status: SpkItemStatusEnum.InAuction },
    );
  }
}
