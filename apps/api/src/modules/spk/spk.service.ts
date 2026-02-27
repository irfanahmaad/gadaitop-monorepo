import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type FindOptionsWhere, Repository } from 'typeorm';

import { validateHash } from '../../common/utils';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { SpkItemConditionEnum } from '../../constants/spk-item-condition';
import { SpkStatusEnum } from '../../constants/spk-status';
import { NkbPaymentMethodEnum } from '../../constants/nkb-payment-method';
import { NkbPaymentTypeEnum } from '../../constants/nkb-payment-type';
import { NkbStatusEnum } from '../../constants/nkb-status';
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
import { InterestCalculatorService } from './services/interest-calculator.service';

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
    private interestCalculator: InterestCalculatorService,
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

    const isOverdue = queryDto.status === SpkStatusEnum.Overdue;
    const qbOptions: QueryBuilderOptionsType<SpkRecordEntity> = {
      ...queryDto,
      // When loading overdue SPKs we need items + itemType; a restrictive select
      // would override leftJoinAndSelect and leave items empty, so omit select.
      ...(!isOverdue && {
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
            name: true,
          },
          store: {
            id: true,
          },
          pt: {
            id: true,
          },
        } as any,
      }),
      relation: {
        customer: true,
        store: true,
        pt: true,
        ...(isOverdue && {
          items: { itemType: true },
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

    const data = records.map((r) => new SpkDto(r));
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
    return this.findOne(uuid);
  }

  async extend(
    uuid: string,
    dto: ExtendSpkDto,
    createdBy: string | null,
  ): Promise<{ nkbNumber: string }> {
    const spk = await this.spkRepository.findOne({
      where: { uuid },
      relations: ['pt'],
    });
    if (!spk) {
      throw new NotFoundException(`SPK with UUID ${uuid} not found`);
    }
    if (
      spk.status !== SpkStatusEnum.Active &&
      spk.status !== SpkStatusEnum.Extended
    ) {
      throw new BadRequestException(
        'Only active or extended SPK can request extension',
      );
    }
    const nkbNumber = await this.generateNkbNumber();
    const nkb = this.nkbRepository.create({
      nkbNumber,
      spkId: spk.uuid,
      amountPaid: String(dto.amountPaid),
      paymentType: NkbPaymentTypeEnum.Renewal,
      paymentMethod: NkbPaymentMethodEnum.Cash,
      status: NkbStatusEnum.Pending,
      createdBy,
      isCustomerInitiated: !createdBy,
    });
    await this.nkbRepository.save(nkb);
    return { nkbNumber };
  }

  async redeem(
    uuid: string,
    amountPaid?: number,
    createdBy?: string | null,
  ): Promise<{ nkbNumber: string }> {
    const spk = await this.spkRepository.findOne({
      where: { uuid },
    });
    if (!spk) {
      throw new NotFoundException(`SPK with UUID ${uuid} not found`);
    }
    if (
      spk.status !== SpkStatusEnum.Active &&
      spk.status !== SpkStatusEnum.Extended
    ) {
      throw new BadRequestException(
        'Only active or extended SPK can be redeemed',
      );
    }
    const amount =
      amountPaid ?? Number(spk.remainingBalance);
    const nkbNumber = await this.generateNkbNumber();
    const nkb = this.nkbRepository.create({
      nkbNumber,
      spkId: spk.uuid,
      amountPaid: String(amount),
      paymentType: NkbPaymentTypeEnum.FullRedemption,
      paymentMethod: NkbPaymentMethodEnum.Cash,
      status: NkbStatusEnum.Pending,
      createdBy: createdBy ?? null,
      isCustomerInitiated: !createdBy,
    });
    await this.nkbRepository.save(nkb);
    return { nkbNumber };
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

  private async generateNkbNumber(): Promise<string> {
    const prefix = 'NKB';
    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    let candidate: string;
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 100) {
      const random = Math.floor(100000 + Math.random() * 900000);
      candidate = `${prefix}${datePart}${random}`;
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
}
