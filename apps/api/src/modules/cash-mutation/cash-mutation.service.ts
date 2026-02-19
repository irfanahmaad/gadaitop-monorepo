import {
  BadRequestException,
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
import { CashMutationCategoryEnum } from '../../constants/cash-mutation-category';
import { CashMutationTypeEnum } from '../../constants/cash-mutation-type';
import { CashMutationEntity } from './entities/cash-mutation.entity';
import { CashMutationDto } from './dto/cash-mutation.dto';
import { QueryCashMutationDto } from './dto/query-cash-mutation.dto';
import { CreateCashMutationDto } from './dto/create-cash-mutation.dto';

@Injectable()
export class CashMutationService {
  constructor(
    @InjectRepository(CashMutationEntity)
    private cashMutationRepository: Repository<CashMutationEntity>,
  ) {}

  async findAll(
    queryDto: QueryCashMutationDto,
    storeId?: string,
  ): Promise<{ data: CashMutationDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<CashMutationEntity> = {};

    const effectiveStoreId = queryDto.storeId ?? storeId;
    if (effectiveStoreId) {
      where.storeId = effectiveStoreId;
    }
    if (queryDto.mutationType) {
      where.mutationType = queryDto.mutationType;
    }
    if (queryDto.category) {
      where.category = queryDto.category;
    }

    const qbOptions: QueryBuilderOptionsType<CashMutationEntity> = {
      ...queryDto,
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        mutationDate: { mutationDate: true },
        createdAt: { createdAt: true },
      }) ?? { mutationDate: 'DESC' } as any,
    };

    // Apply date range filters via raw where (Between operator not easily declarative)
    const qb = CashMutationEntity.createQueryBuilder('mutation');
    if (queryDto.dateFrom) {
      qb.andWhere('mutation.mutationDate >= :dateFrom', {
        dateFrom: queryDto.dateFrom,
      });
    }
    if (queryDto.dateTo) {
      qb.andWhere('mutation.mutationDate <= :dateTo', {
        dateTo: queryDto.dateTo,
      });
    }

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.cashMutationRepository.metadata);
    const [records, count] = await dynamicQueryBuilder.buildDynamicQuery(
      qb,
      qbOptions,
    );
    const data = records.map((r) => new CashMutationDto(r));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async getBalance(storeId: string): Promise<{ balance: number }> {
    const latest = await this.cashMutationRepository.findOne({
      where: { storeId },
      order: { mutationDate: 'DESC', id: 'DESC' },
    });
    const balance = latest ? Number(latest.balanceAfter) : 0;
    return { balance };
  }

  async create(
    createDto: CreateCashMutationDto,
    createdBy: string,
  ): Promise<CashMutationDto> {
    const { balance } = await this.getBalance(createDto.storeId);
    const amount = createDto.amount;
    let balanceBefore = balance;
    let balanceAfter: number;
    if (createDto.mutationType === CashMutationTypeEnum.Credit) {
      balanceAfter = balanceBefore + amount;
    } else if (createDto.mutationType === CashMutationTypeEnum.Debit) {
      balanceAfter = balanceBefore - amount;
      if (balanceAfter < 0) {
        throw new BadRequestException(
          'Insufficient balance for debit mutation',
        );
      }
    } else {
      balanceAfter = balanceBefore + amount;
    }

    const mutation = this.cashMutationRepository.create({
      storeId: createDto.storeId,
      mutationDate: new Date(),
      mutationType: createDto.mutationType,
      category: createDto.category,
      amount: String(amount),
      balanceBefore: String(balanceBefore),
      balanceAfter: String(balanceAfter),
      description: createDto.description ?? null,
      referenceType: null,
      referenceId: null,
      createdBy,
    });
    const saved = await this.cashMutationRepository.save(mutation);
    return new CashMutationDto(saved);
  }

  async createFromSpkDisbursement(
    storeId: string,
    amount: number,
    referenceId: string,
    createdBy: string,
  ): Promise<CashMutationEntity> {
    const { balance } = await this.getBalance(storeId);
    const balanceBefore = balance;
    const balanceAfter = balanceBefore - amount;
    if (balanceAfter < 0) {
      throw new BadRequestException(
        'Insufficient store balance for SPK disbursement',
      );
    }
    const mutation = this.cashMutationRepository.create({
      storeId,
      mutationDate: new Date(),
      mutationType: CashMutationTypeEnum.Debit,
      category: CashMutationCategoryEnum.SpkDisbursement,
      amount: String(amount),
      balanceBefore: String(balanceBefore),
      balanceAfter: String(balanceAfter),
      description: `SPK disbursement`,
      referenceType: 'spk_record',
      referenceId,
      createdBy,
    });
    return this.cashMutationRepository.save(mutation);
  }

  async createFromNkbPayment(
    storeId: string,
    amount: number,
    referenceId: string,
    createdBy: string,
  ): Promise<CashMutationEntity> {
    const { balance } = await this.getBalance(storeId);
    const balanceBefore = balance;
    const balanceAfter = balanceBefore + amount;
    const mutation = this.cashMutationRepository.create({
      storeId,
      mutationDate: new Date(),
      mutationType: CashMutationTypeEnum.Credit,
      category: CashMutationCategoryEnum.NkbPayment,
      amount: String(amount),
      balanceBefore: String(balanceBefore),
      balanceAfter: String(balanceAfter),
      description: `NKB payment`,
      referenceType: 'nkb_record',
      referenceId,
      createdBy,
    });
    return this.cashMutationRepository.save(mutation);
  }
}
