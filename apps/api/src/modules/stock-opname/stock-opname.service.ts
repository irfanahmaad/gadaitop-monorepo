import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { StockOpnameSessionStatusEnum } from '../../constants/stock-opname-session-status';
import { StockOpnameSessionEntity } from './entities/stock-opname-session.entity';
import { StockOpnameSessionStoreEntity } from './entities/stock-opname-session-store.entity';
import { StockOpnameSessionAssigneeEntity } from './entities/stock-opname-session-assignee.entity';
import { StockOpnameSessionPawnTermEntity } from './entities/stock-opname-session-pawn-term.entity';
import { StockOpnameItemEntity } from './entities/stock-opname-item.entity';
import { StockOpnameSessionDto } from './dto/stock-opname-session.dto';
import { CreateStockOpnameSessionDto } from './dto/create-stock-opname-session.dto';
import { QueryStockOpnameDto } from './dto/query-stock-opname.dto';
import { UpdateStockOpnameItemsDto } from './dto/update-stock-opname-items.dto';
import { RecordConditionDto } from './dto/record-condition.dto';
import { UpdateStockOpnameSessionDto } from './dto/update-stock-opname-session.dto';

@Injectable()
export class StockOpnameService {
  constructor(
    @InjectRepository(StockOpnameSessionEntity)
    private sessionRepository: Repository<StockOpnameSessionEntity>,
    @InjectRepository(StockOpnameSessionStoreEntity)
    private sessionStoreRepository: Repository<StockOpnameSessionStoreEntity>,
    @InjectRepository(StockOpnameSessionAssigneeEntity)
    private sessionAssigneeRepository: Repository<StockOpnameSessionAssigneeEntity>,
    @InjectRepository(StockOpnameSessionPawnTermEntity)
    private sessionPawnTermRepository: Repository<StockOpnameSessionPawnTermEntity>,
    @InjectRepository(StockOpnameItemEntity)
    private itemRepository: Repository<StockOpnameItemEntity>,
  ) {}

  async findAll(
    queryDto: QueryStockOpnameDto,
    userPtId?: string,
  ): Promise<{ data: StockOpnameSessionDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<StockOpnameSessionEntity> = {};

    // PT scoping: when user has company scope, use it and ignore client ptId
    if (userPtId) {
      where.ptId = userPtId;
    } else if (queryDto.ptId) {
      where.ptId = queryDto.ptId;
    }
    if (queryDto.status) {
      where.status = queryDto.status;
    }

    let qb = StockOpnameSessionEntity.createQueryBuilder('session')
      .leftJoinAndSelect('session.creator', 'creator')
      .leftJoinAndSelect('session.sessionStores', 'sessionStores')
      .leftJoinAndSelect('sessionStores.store', 'store')
      .leftJoinAndSelect('session.sessionAssignees', 'sessionAssignees')
      .leftJoinAndSelect('sessionAssignees.user', 'assigneeUser')
      .leftJoinAndSelect('session.sessionPawnTerms', 'sessionPawnTerms')
      .leftJoinAndSelect('sessionPawnTerms.pawnTerm', 'pawnTerm')
      .leftJoinAndSelect('pawnTerm.itemType', 'pawnTermItemType');

    if (where.ptId) {
      qb = qb.andWhere('session.ptId = :ptId', { ptId: where.ptId });
    }
    if (where.status) {
      qb = qb.andWhere('session.status = :status', { status: where.status });
    }
    if (queryDto.storeId) {
      qb = qb.andWhere(
        'EXISTS (SELECT 1 FROM stock_opname_session_stores ss WHERE ss.so_session_id = session.uuid AND ss.store_id = :storeId)',
        { storeId: queryDto.storeId },
      );
    }

    const [sessions, count] = await qb
      .orderBy('session.createdAt', 'DESC')
      .skip(((queryDto.page ?? 1) - 1) * (queryDto.pageSize ?? 10))
      .take(queryDto.pageSize ?? 10)
      .getManyAndCount();

    const data = sessions.map((s) => new StockOpnameSessionDto(s));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string, userPtId?: string): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid },
      relations: [
        'creator',
        'sessionStores',
        'sessionStores.store',
        'sessionAssignees',
        'sessionAssignees.user',
        'sessionPawnTerms',
        'sessionPawnTerms.pawnTerm',
        'sessionPawnTerms.pawnTerm.itemType',
        'items',
        'items.spkItem',
        'items.spkItem.itemType',
        'items.spkItem.spk',
      ],
    });
    if (!session) {
      throw new NotFoundException(
        `Stock opname session with UUID ${uuid} not found`,
      );
    }
    if (userPtId && session.ptId !== userPtId) {
      throw new ForbiddenException('Session does not belong to your company');
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
      startDate: new Date(createDto.startDate),
      status: StockOpnameSessionStatusEnum.Draft,
      createdBy,
      notes: createDto.notes ?? null,
      mataItemCount:
        createDto.mataItemCount != null ? createDto.mataItemCount : null,
    });
    const saved = await this.sessionRepository.save(session);

    for (const storeId of createDto.storeIds) {
      await this.sessionStoreRepository.save(
        this.sessionStoreRepository.create({
          session: saved,
          store: { uuid: storeId },
        }),
      );
    }
    for (const userId of createDto.assignedToIds ?? []) {
      await this.sessionAssigneeRepository.save(
        this.sessionAssigneeRepository.create({
          session: saved,
          user: { uuid: userId },
        }),
      );
    }
    for (const pawnTermId of createDto.pawnTermIds ?? []) {
      await this.sessionPawnTermRepository.save(
        this.sessionPawnTermRepository.create({
          session: saved,
          pawnTerm: { uuid: pawnTermId },
        }),
      );
    }
    return this.findOne(saved.uuid);
  }

  async update(
    sessionUuid: string,
    updateDto: UpdateStockOpnameSessionDto,
    userPtId?: string,
  ): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
      relations: ['sessionStores', 'sessionAssignees', 'sessionPawnTerms'],
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (userPtId && session.ptId !== userPtId) {
      throw new ForbiddenException('Session does not belong to your company');
    }
    if (session.status !== StockOpnameSessionStatusEnum.Draft) {
      throw new BadRequestException(
        'Only draft sessions can be updated',
      );
    }

    if (updateDto.startDate !== undefined) {
      session.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.notes !== undefined) {
      session.notes = updateDto.notes;
    }
    if (updateDto.mataItemCount !== undefined) {
      session.mataItemCount = updateDto.mataItemCount;
    }
    await this.sessionRepository.save(session);

    if (updateDto.storeIds !== undefined) {
      await this.sessionStoreRepository
        .createQueryBuilder()
        .delete()
        .where('so_session_id = :sessionUuid', { sessionUuid })
        .execute();
      for (const storeId of updateDto.storeIds) {
        await this.sessionStoreRepository.save(
          this.sessionStoreRepository.create({
            session: { uuid: sessionUuid },
            store: { uuid: storeId },
          }),
        );
      }
    }
    if (updateDto.assignedToIds !== undefined) {
      await this.sessionAssigneeRepository
        .createQueryBuilder()
        .delete()
        .where('so_session_id = :sessionUuid', { sessionUuid })
        .execute();
      for (const userId of updateDto.assignedToIds) {
        await this.sessionAssigneeRepository.save(
          this.sessionAssigneeRepository.create({
            session: { uuid: sessionUuid },
            user: { uuid: userId },
          }),
        );
      }
    }
    if (updateDto.pawnTermIds !== undefined) {
      await this.sessionPawnTermRepository
        .createQueryBuilder()
        .delete()
        .where('so_session_id = :sessionUuid', { sessionUuid })
        .execute();
      for (const pawnTermId of updateDto.pawnTermIds) {
        await this.sessionPawnTermRepository.save(
          this.sessionPawnTermRepository.create({
            session: { uuid: sessionUuid },
            pawnTerm: { uuid: pawnTermId },
          }),
        );
      }
    }

    return this.findOne(sessionUuid);
  }

  async updateItems(
    sessionUuid: string,
    dto: UpdateStockOpnameItemsDto,
    countedBy: string,
    userPtId?: string,
  ): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
      relations: ['items'],
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (userPtId && session.ptId !== userPtId) {
      throw new ForbiddenException('Session does not belong to your company');
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
    return this.findOne(sessionUuid, userPtId);
  }

  async recordCondition(
    sessionUuid: string,
    itemId: string,
    dto: RecordConditionDto,
    countedBy: string,
    userPtId?: string,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (userPtId && session.ptId !== userPtId) {
      throw new ForbiddenException('Session does not belong to your company');
    }
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

  async complete(sessionUuid: string, userPtId?: string): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (userPtId && session.ptId !== userPtId) {
      throw new ForbiddenException('Session does not belong to your company');
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
    return this.findOne(sessionUuid, userPtId);
  }

  async approve(
    sessionUuid: string,
    approvedBy: string,
    userPtId?: string,
  ): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (userPtId && session.ptId !== userPtId) {
      throw new ForbiddenException('Session does not belong to your company');
    }
    if (session.status !== StockOpnameSessionStatusEnum.Completed) {
      throw new BadRequestException('Only completed sessions can be approved');
    }
    session.status = StockOpnameSessionStatusEnum.Approved;
    session.approvedBy = approvedBy;
    session.approvedAt = new Date();
    await this.sessionRepository.save(session);
    return this.findOne(sessionUuid, userPtId);
  }

  async remove(sessionUuid: string, userPtId?: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
    });
    if (!session) {
      throw new NotFoundException('Stock opname session not found');
    }
    if (userPtId && session.ptId !== userPtId) {
      throw new ForbiddenException('Session does not belong to your company');
    }
    if (session.status !== StockOpnameSessionStatusEnum.Draft) {
      throw new BadRequestException(
        'Only draft sessions can be deleted. Session is already in progress or completed.',
      );
    }
    await this.itemRepository
      .createQueryBuilder()
      .delete()
      .where('so_session_id = :sessionUuid', { sessionUuid })
      .execute();
    await this.sessionStoreRepository
      .createQueryBuilder()
      .delete()
      .where('so_session_id = :sessionUuid', { sessionUuid })
      .execute();
    await this.sessionAssigneeRepository
      .createQueryBuilder()
      .delete()
      .where('so_session_id = :sessionUuid', { sessionUuid })
      .execute();
    await this.sessionPawnTermRepository
      .createQueryBuilder()
      .delete()
      .where('so_session_id = :sessionUuid', { sessionUuid })
      .execute();
    await this.sessionRepository.delete({ uuid: sessionUuid });
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
