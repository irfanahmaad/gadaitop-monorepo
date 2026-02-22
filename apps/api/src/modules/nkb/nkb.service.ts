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
import { NkbPaymentTypeEnum } from '../../constants/nkb-payment-type';
import { NkbStatusEnum } from '../../constants/nkb-status';
import { SpkStatusEnum } from '../../constants/spk-status';
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
  ) {}

  async findAll(
    queryDto: QueryNkbDto,
    userPtId?: string,
  ): Promise<{ data: NkbDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<NkbRecordEntity> = {};

    if (queryDto.spkId) {
      where.spkId = queryDto.spkId;
    }
    if (queryDto.status) {
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

    // Apply ptId and storeId directly to nkb entity
    const qb = NkbRecordEntity.createQueryBuilder('nkb');
    if (userPtId) {
      qb.andWhere('nkb.ptId = :ptId', { ptId: userPtId });
    }
    if (queryDto.ptId) {
      qb.andWhere('nkb.ptId = :ptId', { ptId: queryDto.ptId });
    }
    if (queryDto.branchId) {
      qb.andWhere('nkb.storeId = :storeId', { storeId: queryDto.branchId });
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

  async create(createDto: CreateNkbDto, createdBy: string | null): Promise<NkbDto> {
    const spk = await this.spkRepository.findOne({
      where: { uuid: createDto.spkId },
    });
    if (!spk) {
      throw new NotFoundException('SPK not found');
    }
    if (
      spk.status !== SpkStatusEnum.Active &&
      spk.status !== SpkStatusEnum.Extended
    ) {
      throw new BadRequestException(
        'NKB can only be created for active or extended SPK',
      );
    }
    const nkbNumber = await this.generateNkbNumber();
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
      const remaining = Number(spk.remainingBalance) - Number(nkb.amountPaid);
      spk.remainingBalance = String(Math.max(0, remaining));
      if (remaining <= 0) {
        spk.status = SpkStatusEnum.Redeemed;
      } else if (
        nkb.paymentType === NkbPaymentTypeEnum.Renewal &&
        (spk.status === SpkStatusEnum.Active || spk.status === SpkStatusEnum.Extended)
      ) {
        spk.status = SpkStatusEnum.Extended;
      }
      await this.spkRepository.save(spk);
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

  private async generateNkbNumber(): Promise<string> {
    const prefix = 'NKB';
    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    let candidate = '';
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
    if (exists || !candidate) {
      throw new BadRequestException('Could not generate unique NKB number');
    }
    return candidate;
  }
}
