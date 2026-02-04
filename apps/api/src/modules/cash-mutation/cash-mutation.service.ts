import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
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
    const query = this.cashMutationRepository
      .createQueryBuilder('mutation')
      .where('1=1');

    const effectiveStoreId = queryDto.storeId ?? storeId;
    if (effectiveStoreId) {
      query.andWhere('mutation.storeId = :storeId', {
        storeId: effectiveStoreId,
      });
    }
    if (queryDto.dateFrom) {
      query.andWhere('mutation.mutationDate >= :dateFrom', {
        dateFrom: queryDto.dateFrom,
      });
    }
    if (queryDto.dateTo) {
      query.andWhere('mutation.mutationDate <= :dateTo', {
        dateTo: queryDto.dateTo,
      });
    }
    if (queryDto.mutationType) {
      query.andWhere('mutation.mutationType = :mutationType', {
        mutationType: queryDto.mutationType,
      });
    }
    if (queryDto.category) {
      query.andWhere('mutation.category = :category', {
        category: queryDto.category,
      });
    }

    if (queryDto.sortBy) {
      query.orderBy(
        `mutation.${queryDto.sortBy}`,
        queryDto.order || 'DESC',
      );
    } else {
      query.orderBy('mutation.mutationDate', 'DESC').addOrderBy('mutation.id', 'DESC');
    }

    query.skip(queryDto.getSkip());
    const take = queryDto.getTake();
    if (take !== undefined) {
      query.take(take);
    }

    const [records, count] = await query.getManyAndCount();
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
