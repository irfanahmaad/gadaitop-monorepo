import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, type FindOptionsWhere, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { SpkItemStatusEnum } from '../../constants/spk-item-status';
import { StockOpnameSessionStatusEnum } from '../../constants/stock-opname-session-status';
import { CashMutationService } from '../cash-mutation/cash-mutation.service';
import { PawnTermEntity } from '../pawn-term/entities/pawn-term.entity';
import { SpkItemEntity } from '../spk/entities/spk-item.entity';
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
    @InjectRepository(SpkItemEntity)
    private spkItemRepository: Repository<SpkItemEntity>,
    @InjectRepository(PawnTermEntity)
    private pawnTermRepository: Repository<PawnTermEntity>,
    private cashMutationService: CashMutationService,
    private dataSource: DataSource,
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
    const dto = new StockOpnameSessionDto(session);
    const storeIds = (session.sessionStores ?? [])
      .map((ss) => (ss as any).store?.uuid)
      .filter((id): id is string => !!id);
    const storeBalances: Record<string, number> = {};
    let totalBalance = 0;
    for (const storeId of storeIds) {
      try {
        const { balance } = await this.cashMutationService.getBalance(storeId);
        storeBalances[storeId] = balance;
        totalBalance += balance;
      } catch {
        storeBalances[storeId] = 0;
      }
    }
    dto.storeBalances = storeBalances;
    dto.totalStoreBalance = totalBalance;
    return dto;
  }

  /**
   * Check for overlapping sessions: same store + same date, status not approved.
   */
  private async checkOverlappingSessions(
    storeIds: string[],
    startDate: Date,
    excludeSessionUuid?: string,
  ): Promise<void> {
    const dateStr = startDate.toISOString().slice(0, 10);

    let qb = this.sessionRepository
      .createQueryBuilder('s')
      .innerJoin(
        'stock_opname_session_stores',
        'ss',
        'ss.so_session_id = s.uuid',
      )
      .where('s.status IN (:...statuses)', {
        statuses: [
          StockOpnameSessionStatusEnum.Draft,
          StockOpnameSessionStatusEnum.InProgress,
          StockOpnameSessionStatusEnum.Completed,
        ],
      })
      .andWhere('s.start_date::text = :dateStr', { dateStr })
      .andWhere('ss.store_id IN (:...storeIds)', { storeIds });

    if (excludeSessionUuid) {
      qb = qb.andWhere('s.uuid != :excludeUuid', {
        excludeUuid: excludeSessionUuid,
      });
    }

    const overlappingSessions = await qb.getCount();

    if (overlappingSessions > 0) {
      throw new BadRequestException(
        'Sudah terdapat jadwal Stock Opname untuk toko yang sama pada tanggal tersebut. Satu toko hanya dapat divalidasi sekali per hari.',
      );
    }
  }

  async create(
    createDto: CreateStockOpnameSessionDto,
    createdBy: string,
  ): Promise<StockOpnameSessionDto> {
    await this.checkOverlappingSessions(
      createDto.storeIds,
      new Date(createDto.startDate),
    );
    const sessionCode = await this.generateSessionCode();

    const savedUuid = await this.dataSource.transaction(async (manager) => {
      const session = manager.create(StockOpnameSessionEntity, {
        sessionCode,
        ptId: createDto.ptId,
        startDate: new Date(createDto.startDate),
        status: StockOpnameSessionStatusEnum.Draft,
        createdBy,
        notes: createDto.notes ?? null,
        mataItemCount:
          createDto.mataItemCount != null ? createDto.mataItemCount : null,
      });
      const saved = await manager.save(StockOpnameSessionEntity, session);
      const sessionUuid =
        saved.uuid ??
        (await manager.findOne(StockOpnameSessionEntity, { where: { id: saved.id } }))?.uuid;
      if (!sessionUuid) {
        throw new BadRequestException('Failed to create stock opname session');
      }

      for (const storeId of createDto.storeIds) {
        await manager.save(
          StockOpnameSessionStoreEntity,
          manager.create(StockOpnameSessionStoreEntity, {
            session: saved,
            store: { uuid: storeId },
          }),
        );
      }
      for (const userId of createDto.assignedToIds ?? []) {
        await manager.save(
          StockOpnameSessionAssigneeEntity,
          manager.create(StockOpnameSessionAssigneeEntity, {
            session: saved,
            user: { uuid: userId },
          }),
        );
      }
      for (const pawnTermId of createDto.pawnTermIds ?? []) {
        await manager.save(
          StockOpnameSessionPawnTermEntity,
          manager.create(StockOpnameSessionPawnTermEntity, {
            session: saved,
            pawnTerm: { uuid: pawnTermId },
          }),
        );
      }

      await this.materializeScopeItems(manager, sessionUuid, createDto);

      return sessionUuid;
    });

    return this.findOne(savedUuid);
  }

  /**
   * Select eligible in-storage items matching pawn terms and create
   * stock_opname_items. Limits to mataItemCount when specified.
   */
  private async materializeScopeItems(
    manager: import('typeorm').EntityManager,
    sessionUuid: string,
    createDto: CreateStockOpnameSessionDto,
  ): Promise<void> {
    const pawnTermIds = createDto.pawnTermIds ?? [];
    const mataItemCount = createDto.mataItemCount ?? 0;

    if (pawnTermIds.length === 0 || mataItemCount < 1) {
      return;
    }

    const eligibleItems = await manager
      .getRepository(SpkItemEntity)
      .createQueryBuilder('item')
      .innerJoin('item.spk', 'spk')
      .innerJoinAndSelect('item.itemType', 'itemType')
      .where('item.status = :status', { status: SpkItemStatusEnum.InStorage })
      .andWhere('spk.storeId IN (:...storeIds)', {
        storeIds: createDto.storeIds,
      })
      .andWhere('spk.ptId = :ptId', { ptId: createDto.ptId })
      .getMany();

    const pawnTerms = await manager.getRepository(PawnTermEntity).find({
      where: { uuid: In(pawnTermIds) },
      relations: ['itemType'],
    });

    const pawnTermIdsSet = new Set(pawnTermIds);
    const filteredTerms = pawnTerms.filter((pt) => pawnTermIdsSet.has(pt.uuid));

    const matchingItems: SpkItemEntity[] = [];
    for (const item of eligibleItems) {
      const value = parseFloat(item.appraisedValue) || 0;
      for (const term of filteredTerms) {
        const typeMatches =
          item.itemTypeId === term.itemTypeId ||
          (item.itemType?.uuid && term.itemType?.uuid &&
            item.itemType.uuid === term.itemType.uuid);
        if (!typeMatches) continue;

        const min = parseFloat(term.loanLimitMin) || 0;
        const max = parseFloat(term.loanLimitMax) || Infinity;
        if (value >= min && value <= max) {
          matchingItems.push(item);
          break;
        }
      }
      if (matchingItems.length >= mataItemCount) break;
    }

    const toInsert = matchingItems.slice(0, mataItemCount);

    for (const spkItem of toInsert) {
      await manager.save(
        StockOpnameItemEntity,
        manager.create(StockOpnameItemEntity, {
          soSessionId: sessionUuid,
          spkItemId: spkItem.uuid,
          systemQuantity: 1,
          countedQuantity: null,
          conditionBefore: spkItem.condition,
        }),
      );
    }

    if (toInsert.length > 0) {
      const session = await manager.findOne(StockOpnameSessionEntity, {
        where: { uuid: sessionUuid },
        relations: ['items'],
      });
      if (session?.items) {
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
        await manager.save(StockOpnameSessionEntity, session);
      }
    }
  }

  async update(
    sessionUuid: string,
    updateDto: UpdateStockOpnameSessionDto,
    userPtId?: string,
  ): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
      relations: [
        'sessionStores',
        'sessionStores.store',
        'sessionAssignees',
        'sessionPawnTerms',
      ],
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

    const storeIds =
      updateDto.storeIds ??
      session.sessionStores?.map((ss) => (ss as any).store?.uuid).filter((id): id is string => !!id) ??
      [];
    const startDate = updateDto.startDate !== undefined
      ? new Date(updateDto.startDate)
      : session.startDate;
    if (storeIds.length > 0) {
      await this.checkOverlappingSessions(
        storeIds as string[],
        startDate,
        sessionUuid,
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

  async start(sessionUuid: string, userPtId?: string): Promise<StockOpnameSessionDto> {
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
        'Only draft sessions can be started. Session is already in progress, completed, or approved.',
      );
    }
    session.status = StockOpnameSessionStatusEnum.InProgress;
    await this.sessionRepository.save(session);
    return this.findOne(sessionUuid, userPtId);
  }

  async complete(sessionUuid: string, userPtId?: string): Promise<StockOpnameSessionDto> {
    const session = await this.sessionRepository.findOne({
      where: { uuid: sessionUuid },
      relations: [
        'items',
        'items.spkItem',
        'items.spkItem.itemType',
        'sessionPawnTerms',
        'sessionPawnTerms.pawnTerm',
        'sessionPawnTerms.pawnTerm.itemType',
      ],
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

    // Validate all items have been counted
    for (const item of session.items ?? []) {
      if (item.countedQuantity == null || item.countedQuantity < 0) {
        throw new BadRequestException(
          'Semua item wajib telah dihitung (counted). Silakan lengkapi penilaian untuk semua item.',
        );
      }
    }

    // Validate mata items have condition and photo evidence
    const pawnTerms = session.sessionPawnTerms?.map((spt) => spt.pawnTerm).filter(Boolean) ?? [];
    for (const item of session.items ?? []) {
      const spkItem = item.spkItem;
      if (!spkItem) continue;
      const isMata = this.isItemMata(spkItem, pawnTerms, session.ptId);
      if (isMata) {
        if (!item.conditionAfter) {
          throw new BadRequestException(
            'Semua item Syarat Mata wajib memiliki hasil penilaian kondisi. Silakan lengkapi penilaian untuk semua item.',
          );
        }
        if (!item.damagePhotos?.length) {
          throw new BadRequestException(
            'Semua item Syarat Mata wajib dilampirkan bukti foto. Silakan upload foto untuk item yang belum memiliki bukti.',
          );
        }
      }
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

  async reopen(
    sessionUuid: string,
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
    if (session.status !== StockOpnameSessionStatusEnum.Completed) {
      throw new BadRequestException(
        'Only completed sessions can be returned to draft',
      );
    }

    // Reset per-item counting and condition so staff can rescan
    if (session.items?.length) {
      for (const item of session.items) {
        item.countedQuantity = null;
        item.conditionAfter = null;
        item.conditionNotes = null;
        item.damagePhotos = null;
        item.countedBy = null;
        item.countedAt = null;
        await this.itemRepository.save(item);
      }
    }

    // Reset session status and aggregates back to draft
    session.status = StockOpnameSessionStatusEnum.Draft;
    session.endDate = null;
    session.approvedBy = null;
    session.approvedAt = null;
    session.totalItemsCounted = 0;
    session.variancesCount = 0;
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

  /**
   * Check if an SPK item matches any session pawn term (mata criteria).
   */
  private isItemMata(
    spkItem: { itemTypeId?: string; itemType?: { uuid?: string }; appraisedValue?: string },
    pawnTerms: Array<{
      itemTypeId?: string;
      itemType?: { uuid?: string };
      loanLimitMin?: string;
      loanLimitMax?: string;
      ptId?: string;
    }>,
    ptId?: string,
  ): boolean {
    if (!pawnTerms?.length) return false;
    const itemTypeId = spkItem.itemTypeId ?? spkItem.itemType?.uuid;
    const value = parseFloat(spkItem.appraisedValue ?? '0') || 0;
    for (const term of pawnTerms) {
      if (ptId && term.ptId !== ptId) continue;
      const termItemTypeId = term.itemTypeId ?? term.itemType?.uuid;
      const typeMatches = itemTypeId && termItemTypeId && itemTypeId === termItemTypeId;
      if (!typeMatches) continue;
      const min = parseFloat(term.loanLimitMin ?? '0') || 0;
      const max = parseFloat(term.loanLimitMax ?? '0') || Infinity;
      if (value >= min && value <= max) return true;
    }
    return false;
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
