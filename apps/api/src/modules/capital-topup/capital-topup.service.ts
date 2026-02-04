import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { CapitalTopupStatusEnum } from '../../constants/capital-topup-status';
import { CapitalTopupEntity } from './entities/capital-topup.entity';
import { CapitalTopupDto } from './dto/capital-topup.dto';
import { CreateCapitalTopupDto } from './dto/create-capital-topup.dto';
import { UpdateCapitalTopupDto } from './dto/update-capital-topup.dto';
import { QueryCapitalTopupDto } from './dto/query-capital-topup.dto';
import { RejectCapitalTopupDto } from './dto/reject-capital-topup.dto';
import { DisburseCapitalTopupDto } from './dto/disburse-capital-topup.dto';

@Injectable()
export class CapitalTopupService {
  constructor(
    @InjectRepository(CapitalTopupEntity)
    private capitalTopupRepository: Repository<CapitalTopupEntity>,
  ) {}

  async findAll(
    queryDto: QueryCapitalTopupDto,
    userPtId?: string,
  ): Promise<{ data: CapitalTopupDto[]; meta: PageMetaDto }> {
    const query = this.capitalTopupRepository
      .createQueryBuilder('topup')
      .leftJoinAndSelect('topup.store', 'store')
      .leftJoinAndSelect('topup.pt', 'pt');

    if (userPtId) {
      query.andWhere('topup.ptId = :ptId', { ptId: userPtId });
    }
    if (queryDto.ptId) {
      query.andWhere('topup.ptId = :ptId', { ptId: queryDto.ptId });
    }
    if (queryDto.storeId) {
      query.andWhere('topup.storeId = :storeId', {
        storeId: queryDto.storeId,
      });
    }
    if (queryDto.status) {
      query.andWhere('topup.status = :status', { status: queryDto.status });
    }

    if (queryDto.sortBy) {
      query.orderBy(`topup.${queryDto.sortBy}`, queryDto.order || 'DESC');
    } else {
      query.orderBy('topup.createdAt', 'DESC');
    }

    query.skip(queryDto.getSkip());
    const take = queryDto.getTake();
    if (take !== undefined) {
      query.take(take);
    }

    const [records, count] = await query.getManyAndCount();
    const data = records.map((r) => new CapitalTopupDto(r));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string): Promise<CapitalTopupDto> {
    const record = await this.capitalTopupRepository.findOne({
      where: { uuid },
      relations: ['store', 'pt', 'requester', 'approver'],
    });
    if (!record) {
      throw new NotFoundException(
        `Capital topup with UUID ${uuid} not found`,
      );
    }
    return new CapitalTopupDto(record);
  }

  async create(
    createDto: CreateCapitalTopupDto,
    requestedBy: string,
  ): Promise<CapitalTopupDto> {
    const topupCode = await this.generateTopupCode();
    const topup = this.capitalTopupRepository.create({
      topupCode,
      storeId: createDto.storeId,
      ptId: createDto.ptId,
      amount: String(createDto.amount),
      reason: createDto.reason,
      status: CapitalTopupStatusEnum.Pending,
      requestedBy,
    });
    const saved = await this.capitalTopupRepository.save(topup);
    return this.findOne(saved.uuid);
  }

  async update(
    uuid: string,
    updateDto: UpdateCapitalTopupDto,
  ): Promise<CapitalTopupDto> {
    const topup = await this.capitalTopupRepository.findOne({
      where: { uuid },
    });
    if (!topup) {
      throw new NotFoundException(
        `Capital topup with UUID ${uuid} not found`,
      );
    }
    if (topup.status !== CapitalTopupStatusEnum.Pending) {
      throw new BadRequestException(
        'Only pending topup requests can be edited',
      );
    }
    if (updateDto.amount !== undefined) {
      topup.amount = String(updateDto.amount);
    }
    if (updateDto.reason !== undefined) {
      topup.reason = updateDto.reason;
    }
    await this.capitalTopupRepository.save(topup);
    return this.findOne(uuid);
  }

  async approve(uuid: string, approvedBy: string): Promise<CapitalTopupDto> {
    const topup = await this.capitalTopupRepository.findOne({
      where: { uuid },
    });
    if (!topup) {
      throw new NotFoundException(
        `Capital topup with UUID ${uuid} not found`,
      );
    }
    if (topup.status !== CapitalTopupStatusEnum.Pending) {
      throw new BadRequestException('Only pending topups can be approved');
    }
    topup.status = CapitalTopupStatusEnum.Approved;
    topup.approvedBy = approvedBy;
    topup.approvedAt = new Date();
    await this.capitalTopupRepository.save(topup);
    return this.findOne(uuid);
  }

  async reject(
    uuid: string,
    dto: RejectCapitalTopupDto,
    rejectedBy: string,
  ): Promise<CapitalTopupDto> {
    const topup = await this.capitalTopupRepository.findOne({
      where: { uuid },
    });
    if (!topup) {
      throw new NotFoundException(
        `Capital topup with UUID ${uuid} not found`,
      );
    }
    if (topup.status !== CapitalTopupStatusEnum.Pending) {
      throw new BadRequestException('Only pending topups can be rejected');
    }
    topup.status = CapitalTopupStatusEnum.Rejected;
    topup.rejectionReason = dto.reason ?? null;
    topup.approvedBy = rejectedBy;
    topup.approvedAt = new Date();
    await this.capitalTopupRepository.save(topup);
    return this.findOne(uuid);
  }

  async disburse(
    uuid: string,
    dto: DisburseCapitalTopupDto,
  ): Promise<CapitalTopupDto> {
    const topup = await this.capitalTopupRepository.findOne({
      where: { uuid },
    });
    if (!topup) {
      throw new NotFoundException(
        `Capital topup with UUID ${uuid} not found`,
      );
    }
    if (topup.status !== CapitalTopupStatusEnum.Approved) {
      throw new BadRequestException(
        'Only approved topups can be marked as disbursed',
      );
    }
    topup.status = CapitalTopupStatusEnum.Disbursed;
    topup.disbursedAt = new Date();
    topup.disbursementProofUrl = dto.disbursementProofUrl ?? null;
    await this.capitalTopupRepository.save(topup);
    return this.findOne(uuid);
  }

  private async generateTopupCode(): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let candidate = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 100) {
      const random = Math.floor(10000 + Math.random() * 90000);
      candidate = `TOPUP-${datePart}-${random}`;
      const found = await this.capitalTopupRepository.findOne({
        where: { topupCode: candidate },
      });
      exists = !!found;
      attempts++;
    }
    if (exists || !candidate) {
      throw new BadRequestException('Could not generate unique topup code');
    }
    return candidate;
  }
}
