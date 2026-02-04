import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { CashDepositPaymentMethodEnum } from '../../constants/cash-deposit-payment-method';
import { CashDepositStatusEnum } from '../../constants/cash-deposit-status';
import { CashDepositEntity } from './entities/cash-deposit.entity';
import { CashDepositDto } from './dto/cash-deposit.dto';
import { CreateCashDepositDto } from './dto/create-cash-deposit.dto';
import { QueryCashDepositDto } from './dto/query-cash-deposit.dto';
import { RejectCashDepositDto } from './dto/reject-cash-deposit.dto';

@Injectable()
export class CashDepositService {
  constructor(
    @InjectRepository(CashDepositEntity)
    private cashDepositRepository: Repository<CashDepositEntity>,
  ) {}

  async findAll(
    queryDto: QueryCashDepositDto,
    userPtId?: string,
  ): Promise<{ data: CashDepositDto[]; meta: PageMetaDto }> {
    const query = this.cashDepositRepository
      .createQueryBuilder('deposit')
      .leftJoinAndSelect('deposit.store', 'store')
      .leftJoinAndSelect('deposit.pt', 'pt');

    if (userPtId) {
      query.andWhere('deposit.ptId = :ptId', { ptId: userPtId });
    }
    if (queryDto.ptId) {
      query.andWhere('deposit.ptId = :ptId', { ptId: queryDto.ptId });
    }
    if (queryDto.storeId) {
      query.andWhere('deposit.storeId = :storeId', {
        storeId: queryDto.storeId,
      });
    }
    if (queryDto.status) {
      query.andWhere('deposit.status = :status', { status: queryDto.status });
    }

    if (queryDto.sortBy) {
      query.orderBy(`deposit.${queryDto.sortBy}`, queryDto.order || 'DESC');
    } else {
      query.orderBy('deposit.createdAt', 'DESC');
    }

    query.skip(queryDto.getSkip());
    const take = queryDto.getTake();
    if (take !== undefined) {
      query.take(take);
    }

    const [records, count] = await query.getManyAndCount();
    const data = records.map((r) => new CashDepositDto(r));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string): Promise<CashDepositDto> {
    const record = await this.cashDepositRepository.findOne({
      where: { uuid },
      relations: ['store', 'pt', 'requester', 'approver'],
    });
    if (!record) {
      throw new NotFoundException(`Cash deposit with UUID ${uuid} not found`);
    }
    return new CashDepositDto(record);
  }

  async create(
    createDto: CreateCashDepositDto,
    requestedBy: string,
  ): Promise<CashDepositDto> {
    const depositCode = await this.generateDepositCode();
    const deposit = this.cashDepositRepository.create({
      depositCode,
      storeId: createDto.storeId,
      ptId: createDto.ptId,
      amount: String(createDto.amount),
      paymentMethod: createDto.paymentMethod,
      paymentChannel: createDto.paymentChannel ?? null,
      qrCodeUrl: createDto.paymentMethod === CashDepositPaymentMethodEnum.Qris ? `https://placeholder-qr.example.com/${depositCode}` : null,
      virtualAccount:
        createDto.paymentMethod === CashDepositPaymentMethodEnum.VirtualAccount
          ? `VA${depositCode.replace(/-/g, '')}`
          : null,
      status: CashDepositStatusEnum.Pending,
      requestedBy,
      notes: createDto.notes ?? null,
    });
    const saved = await this.cashDepositRepository.save(deposit);
    return this.findOne(saved.uuid);
  }

  async approve(uuid: string, approvedBy: string): Promise<CashDepositDto> {
    const deposit = await this.cashDepositRepository.findOne({
      where: { uuid },
    });
    if (!deposit) {
      throw new NotFoundException(`Cash deposit with UUID ${uuid} not found`);
    }
    if (deposit.status !== CashDepositStatusEnum.Pending && deposit.status !== CashDepositStatusEnum.Paid) {
      throw new BadRequestException(
        'Only pending or paid deposits can be approved',
      );
    }
    deposit.status = CashDepositStatusEnum.Confirmed;
    deposit.approvedBy = approvedBy;
    deposit.approvedAt = new Date();
    await this.cashDepositRepository.save(deposit);
    return this.findOne(uuid);
  }

  async reject(
    uuid: string,
    dto: RejectCashDepositDto,
    rejectedBy: string,
  ): Promise<CashDepositDto> {
    const deposit = await this.cashDepositRepository.findOne({
      where: { uuid },
    });
    if (!deposit) {
      throw new NotFoundException(`Cash deposit with UUID ${uuid} not found`);
    }
    if (deposit.status !== CashDepositStatusEnum.Pending && deposit.status !== CashDepositStatusEnum.Paid) {
      throw new BadRequestException(
        'Only pending or paid deposits can be rejected',
      );
    }
    deposit.status = CashDepositStatusEnum.Rejected;
    deposit.rejectionReason = dto.reason ?? null;
    deposit.approvedBy = rejectedBy;
    deposit.approvedAt = new Date();
    await this.cashDepositRepository.save(deposit);
    return this.findOne(uuid);
  }

  async webhook(payload: Record<string, unknown>): Promise<{ received: boolean }> {
    // Placeholder: integrate with payment gateway (Midtrans, Xendit, etc.)
    return { received: true };
  }

  private async generateDepositCode(): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let candidate = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 100) {
      const random = Math.floor(10000 + Math.random() * 90000);
      candidate = `DEP-${datePart}-${random}`;
      const found = await this.cashDepositRepository.findOne({
        where: { depositCode: candidate },
      });
      exists = !!found;
      attempts++;
    }
    if (exists || !candidate) {
      throw new BadRequestException('Could not generate unique deposit code');
    }
    return candidate;
  }
}
