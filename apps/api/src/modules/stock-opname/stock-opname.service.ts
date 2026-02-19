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
import { StockOpnameSessionStatusEnum } from '../../constants/stock-opname-session-status';
import { StockOpnameSessionEntity } from './entities/stock-opname-session.entity';
import { StockOpnameItemEntity } from './entities/stock-opname-item.entity';
import { StockOpnameSessionDto } from './dto/stock-opname-session.dto';
import { CreateStockOpnameSessionDto } from './dto/create-stock-opname-session.dto';
import { QueryStockOpnameDto } from './dto/query-stock-opname.dto';
import { UpdateStockOpnameItemsDto } from './dto/update-stock-opname-items.dto';
import { RecordConditionDto } from './dto/record-condition.dto';

@Injectable()
export class StockOpnameService {
  constructor(
    @InjectRepository(StockOpnameSessionEntity)
    private sessionRepository: Repository<StockOpnameSessionEntity>,
    @InjectRepository(StockOpnameItemEntity)
    private itemRepository: Repository<StockOpnameItemEntity>,
  ) {}

  async findAll(
    queryDto: QueryStockOpnameDto,
    userPtId?: string,
  ): Promise<{ data: StockOpnameSessionDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<StockOpnameSessionEntity> = {};

    if (userPtId) {
      where.ptId = userPtId;
    }
    if (queryDto.ptId) {
      where.ptId = queryDto.ptId;
    }
    if (queryDto.storeId) {
      where.storeId = queryDto.storeId;
    }
    if (queryDto.status) {
      where.status = queryDto.status;
    }

    const qbOptions: QueryBuilderOptionsType<StockOpnameSessionEntity> = {
      ...queryDto,
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        createdAt: { createdAt: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.sessionRepository.metadata);
    const [sessions, count] = await dynamicQueryBuilder.buildDynamicQuery(
      StockOpnameSessionEntity.createQueryBuilder('session'),
      qbOptions,
    );
    const data = sessions.map((s) => new StockOpnameSessionDto(s));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid },
      relations: ['items', 'items.spkItem'],
    });
    if (!session) {
      throw new NotFoundException(
        `Stock opname session with UUID ${uuid} not found`,
      );
    }
    return new StockOpnameSessionDto(session);
  }

  async create(
    createDto: CreateStockOpnameSessionDto,
    createdBy: string,
  ): Promise<StockOpnameSessionDto> {
    const sessionCode = await this.generateSessionCode();
    const session = this.sessionRepository.create({
      sessionCode,
      ptId: createDto.ptId,
      storeId: createDto.storeId,
      startDate: new Date(createDto.startDate),
      status: StockOpnameSessionStatusEnum.Draft,
      createdBy,
      notes: createDto.notes ?? null,
    });
    const saved = await this.sessionRepository.save(session);
    return this.findOne(saved.uuid);
  }

  async updateItems(
    sessionUuid: string,
    dto: UpdateStockOpnameItemsDto,
    countedBy: string,
  ): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
      relations: ['items'],
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (
      session.status !== StockOpnameSessionStatusEnum.Draft &&
      session.status !== StockOpnameSessionStatusEnum.InProgress
    ) {
      throw new BadRequestException(
        'Only draft or in-progress sessions can update items',
      );
    }
    for (const update of dto.items) {
      const soItem = session.items?.find((i) => i.uuid === update.itemId);
      if (soItem) {
        soItem.countedQuantity = update.countedQuantity;
        soItem.countedBy = countedBy;
        soItem.countedAt = new Date();
        await this.itemRepository.save(soItem);
      }
    }
    await this.recomputeSessionCounts(sessionUuid);
    return this.findOne(sessionUuid);
  }

  async recordCondition(
    sessionUuid: string,
    itemId: string,
    dto: RecordConditionDto,
    countedBy: string,
  ): Promise<void> {
    const soItem = await this.itemRepository.findOne({
      where: { soSessionId: sessionUuid, uuid: itemId },
    });
    if (!soItem) {
      throw new NotFoundException('Stock opname item not found');
    }
    soItem.conditionAfter = dto.conditionAfter;
    soItem.conditionNotes = dto.conditionNotes ?? null;
    soItem.damagePhotos = dto.damagePhotos ?? null;
    soItem.countedBy = countedBy;
    soItem.countedAt = new Date();
    await this.itemRepository.save(soItem);
  }

  async complete(sessionUuid: string): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (
      session.status !== StockOpnameSessionStatusEnum.Draft &&
      session.status !== StockOpnameSessionStatusEnum.InProgress
    ) {
      throw new BadRequestException('Session already completed or approved');
    }
    session.status = StockOpnameSessionStatusEnum.Completed;
    session.endDate = new Date();
    await this.sessionRepository.save(session);
    return this.findOne(sessionUuid);
  }

  async approve(
    sessionUuid: string,
    approvedBy: string,
  ): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (session.status !== StockOpnameSessionStatusEnum.Completed) {
      throw new BadRequestException('Only completed sessions can be approved');
    }
    session.status = StockOpnameSessionStatusEnum.Approved;
    session.approvedBy = approvedBy;
    session.approvedAt = new Date();
    await this.sessionRepository.save(session);
    return this.findOne(sessionUuid);
  }

  private async recomputeSessionCounts(sessionUuid: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
      relations: ['items'],
    });
    if (!session?.items?.length) return;
    let totalCounted = 0;
    let variances = 0;
    for (const item of session.items) {
      totalCounted += item.countedQuantity ?? 0;
      const sys = item.systemQuantity ?? 1;
      const cnt = item.countedQuantity ?? 0;
      if (cnt !== sys) variances += 1;
    }
    session.totalItemsSystem = session.items.length;
    session.totalItemsCounted = totalCounted;
    session.variancesCount = variances;
    await this.sessionRepository.save(session);
  }

  private async generateSessionCode(): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let candidate = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 100) {
      const random = Math.floor(1000 + Math.random() * 9000);
      candidate = `SO-${datePart}-${random}`;
      const found = await this.sessionRepository.findOne({
        where: { sessionCode: candidate },
      });
      exists = !!found;
      attempts++;
    }
    if (exists || !candidate) {
      throw new BadRequestException('Could not generate unique session code');
    }
    return candidate;
  }
}
