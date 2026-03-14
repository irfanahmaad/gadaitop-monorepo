import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type FindOptionsWhere, In, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { AuctionBatchStatusEnum } from '../../constants/auction-batch-status';
import { AuctionAssigneeRoleEnum } from '../../constants/auction-assignee-role';
import { AuctionPickupStatusEnum } from '../../constants/auction-pickup-status';
import { AuctionValidationVerdictEnum } from '../../constants/auction-validation-verdict';
import { SpkStatusEnum } from '../../constants/spk-status';
import { SpkItemStatusEnum } from '../../constants/spk-item-status';
import { AuctionBatchAssigneeEntity } from './entities/auction-batch-assignee.entity';
import { AuctionBatchEntity } from './entities/auction-batch.entity';
import { AuctionBatchItemEntity } from './entities/auction-batch-item.entity';
import { NotificationService } from '../notification/notification.service';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { SpkService } from '../spk/spk.service';
import { AuctionBatchDto } from './dto/auction-batch.dto';
import { CreateAuctionBatchDto } from './dto/create-auction-batch.dto';
import {
  QueryAuctionBatchDto,
  ValidasiLelanganTabEnum,
} from './dto/query-auction-batch.dto';
import { UpdatePickupDto } from './dto/update-pickup.dto';
import { SubmitValidationDto } from './dto/submit-validation.dto';
import { UpdateAuctionBatchDto } from './dto/update-auction-batch.dto';
import { UpdateBatchMarketingDto } from './dto/update-batch-marketing.dto';
import { UpdateBatchItemMarketingDto } from './dto/update-batch-item-marketing.dto';

function getStatusesForTab(
  _assigneeRole: AuctionAssigneeRoleEnum,
  tab: ValidasiLelanganTabEnum,
): AuctionBatchStatusEnum[] {
  switch (tab) {
    case ValidasiLelanganTabEnum.Dijadwalkan:
      return [
        AuctionBatchStatusEnum.Draft,
        AuctionBatchStatusEnum.PickupInProgress,
      ];
    case ValidasiLelanganTabEnum.WaitingForApproval:
      return [AuctionBatchStatusEnum.ValidationPending];
    case ValidasiLelanganTabEnum.Tervalidasi:
      return [AuctionBatchStatusEnum.ReadyForAuction];
    default:
      return [];
  }
}

@Injectable()
export class AuctionService {
  private readonly logger = new Logger(AuctionService.name);

  constructor(
    @InjectRepository(AuctionBatchEntity)
    private readonly batchRepository: Repository<AuctionBatchEntity>,
    @InjectRepository(AuctionBatchAssigneeEntity)
    private readonly batchAssigneeRepository: Repository<AuctionBatchAssigneeEntity>,
    @InjectRepository(AuctionBatchItemEntity)
    private readonly batchItemRepository: Repository<AuctionBatchItemEntity>,
    private readonly notificationService: NotificationService,
    private readonly spkService: SpkService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    queryDto: QueryAuctionBatchDto,
    userPtId?: string,
  ): Promise<{ data: AuctionBatchDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<AuctionBatchEntity> = {};

    if (userPtId) {
      where.ptId = userPtId;
    }
    if (queryDto.ptId) {
      where.ptId = queryDto.ptId;
    }
    if (queryDto.storeId) {
      where.storeId = queryDto.storeId;
    }
    const useTabFilter =
      queryDto.tab != null &&
      queryDto.assignedTo != null &&
      queryDto.assigneeRole != null;
    if (queryDto.status && !useTabFilter) {
      where.status = queryDto.status;
    }

    const qb = this.batchRepository.createQueryBuilder('batch');
    if (queryDto.assignedTo) {
      const assigneeCondition =
        queryDto.assigneeRole != null
          ? `EXISTS (SELECT 1 FROM auction_batch_assignees aba WHERE aba.auction_batch_id = batch.uuid AND aba.user_id = :assignedTo AND aba.role = :assigneeRole)`
          : `EXISTS (SELECT 1 FROM auction_batch_assignees aba WHERE aba.auction_batch_id = batch.uuid AND aba.user_id = :assignedTo)`;
      qb.andWhere(assigneeCondition, {
        assignedTo: queryDto.assignedTo,
        ...(queryDto.assigneeRole != null && {
          assigneeRole: queryDto.assigneeRole,
        }),
      });
    }
    if (useTabFilter && queryDto.tab != null) {
      const statuses = getStatusesForTab(queryDto.assigneeRole!, queryDto.tab);
      qb.andWhere('batch.status IN (:...tabStatuses)', {
        tabStatuses: statuses,
      });
    }

    const qbOptions: QueryBuilderOptionsType<AuctionBatchEntity> = {
      ...queryDto,
      where,
      relation: { batchAssignees: { user: true }, items: true, store: true },
      orderBy: sortAttribute(queryDto.sortBy, {
        createdAt: { createdAt: true },
        batchCode: { batchCode: true },
      }) ?? ({ createdAt: 'DESC' } as any),
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(
      this.batchRepository.metadata,
    );
    const [batches, count] = await dynamicQueryBuilder.buildDynamicQuery(
      qb,
      qbOptions,
    );
    const data = batches.map((b) => new AuctionBatchDto(b));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(
    uuid: string,
    userPtId?: string,
  ): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid },
      relations: [
        'items',
        'items.spkItem',
        'items.spkItem.spk',
        'items.spkItem.itemType',
        'store',
        'batchAssignees',
        'batchAssignees.user',
      ],
    });
    if (!batch) {
      throw new NotFoundException(`Auction batch with UUID ${uuid} not found`);
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    return new AuctionBatchDto(batch);
  }

  async create(
    dto: CreateAuctionBatchDto,
    createdByUserId: string,
  ): Promise<AuctionBatchDto> {
    const items = await this.spkService.findSpkItemsByIdsWithSpk(
      dto.spkItemIds,
    );
    if (items.length !== dto.spkItemIds.length) {
      throw new BadRequestException('One or more SPK item UUIDs not found');
    }

    for (const item of items) {
      const spk = item.spk as SpkRecordEntity;
      if (!spk) {
        throw new BadRequestException(
          `SPK record not found for item ${item.uuid}`,
        );
      }
      if (spk.status !== SpkStatusEnum.Overdue) {
        throw new BadRequestException(
          `SPK ${spk.spkNumber} is not overdue; only overdue SPK items can be added to auction batch`,
        );
      }
      if (item.status !== SpkItemStatusEnum.InStorage) {
        throw new BadRequestException(
          `SPK item ${item.uuid} is not in_storage; status is ${item.status}`,
        );
      }
      if (spk.ptId !== dto.ptId) {
        throw new BadRequestException(
          `SPK item ${item.uuid} does not belong to the given PT`,
        );
      }
    }

    const existingInBatch = await this.batchItemRepository
      .createQueryBuilder('abi')
      .innerJoin('abi.batch', 'b')
      .where('b.status != :cancelled', {
        cancelled: AuctionBatchStatusEnum.Cancelled,
      })
      .andWhere('abi.spkItemId IN (:...ids)', { ids: dto.spkItemIds })
      .getMany();
    if (existingInBatch.length > 0) {
      const dupIds = existingInBatch.map((abi) => abi.spkItemId);
      throw new BadRequestException(
        `SPK item(s) already in an active batch: ${dupIds.join(', ')}`,
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const batchCode = await this.generateBatchCode();
      const batch = manager.create(AuctionBatchEntity, {
        batchCode,
        storeId: dto.storeId,
        ptId: dto.ptId,
        status: AuctionBatchStatusEnum.Draft,
        notes: dto.notes ?? null,
        name: dto.name ?? null,
        createdBy: createdByUserId,
      });
      const savedBatch = await manager.save(AuctionBatchEntity, batch);

      const batchItems = dto.spkItemIds.map((spkItemId) =>
        manager.create(AuctionBatchItemEntity, {
          auctionBatchId: savedBatch.uuid,
          spkItemId,
          pickupStatus: AuctionPickupStatusEnum.Pending,
        }),
      );
      await manager.save(AuctionBatchItemEntity, batchItems);

      for (const userId of dto.marketingStaffIds ?? []) {
        await manager.save(
          AuctionBatchAssigneeEntity,
          manager.create(AuctionBatchAssigneeEntity, {
            batch: { uuid: savedBatch.uuid },
            user: { uuid: userId },
            role: AuctionAssigneeRoleEnum.MarketingStaff,
          }),
        );
      }
      for (const userId of dto.auctionStaffIds ?? []) {
        await manager.save(
          AuctionBatchAssigneeEntity,
          manager.create(AuctionBatchAssigneeEntity, {
            batch: { uuid: savedBatch.uuid },
            user: { uuid: userId },
            role: AuctionAssigneeRoleEnum.AuctionStaff,
          }),
        );
      }

      return savedBatch.uuid;
    }).then((uuid) => this.findOne(uuid));
  }

  async assign(
    batchUuid: string,
    userId: string,
    userPtId?: string,
  ): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    if (batch.status !== AuctionBatchStatusEnum.Draft) {
      throw new BadRequestException(
        'Only draft batches can be assigned',
      );
    }
    // Only assigned auction staff can start pickup (call assign)
    const auctionStaffAssignees = await this.batchAssigneeRepository.find({
      where: {
        batch: { uuid: batchUuid },
        role: AuctionAssigneeRoleEnum.AuctionStaff,
      },
      relations: ['user'],
    });
    const assignedAuctionStaffIds = auctionStaffAssignees
      .map((a) => (a.user as { uuid?: string })?.uuid)
      .filter(Boolean) as string[];
    if (!assignedAuctionStaffIds.includes(userId)) {
      throw new ForbiddenException(
        'Only assigned auction staff can start pickup for this batch',
      );
    }
    const existingAssignment = await this.batchAssigneeRepository.findOne({
      where: {
        batch: { uuid: batchUuid },
        user: { uuid: userId },
        role: AuctionAssigneeRoleEnum.AuctionStaff,
      },
    });
    if (!existingAssignment) {
      await this.batchAssigneeRepository.save(
        this.batchAssigneeRepository.create({
          batch: { uuid: batchUuid },
          user: { uuid: userId },
          role: AuctionAssigneeRoleEnum.AuctionStaff,
        }),
      );
    }
    batch.status = AuctionBatchStatusEnum.PickupInProgress;
    batch.updatedBy = userId;
    await this.batchRepository.save(batch);
    return this.findOne(batchUuid, userPtId);
  }

  async update(
    batchUuid: string,
    dto: UpdateAuctionBatchDto,
    updatedByUserId: string,
    userPtId?: string,
  ): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    const allowedStatuses = [
      AuctionBatchStatusEnum.Draft,
      AuctionBatchStatusEnum.PickupInProgress,
    ];
    if (!allowedStatuses.includes(batch.status)) {
      throw new BadRequestException(
        'Only draft or pickup_in_progress batches can be updated',
      );
    }

    if (dto.name !== undefined) {
      batch.name = dto.name ?? null;
    }
    if (dto.notes !== undefined) {
      batch.notes = dto.notes ?? null;
    }
    if (dto.marketingStaffIds !== undefined || dto.auctionStaffIds !== undefined) {
      await this.batchAssigneeRepository
        .createQueryBuilder()
        .delete()
        .where('auction_batch_id = :batchUuid', { batchUuid })
        .execute();
      for (const userId of dto.marketingStaffIds ?? []) {
        await this.batchAssigneeRepository.save(
          this.batchAssigneeRepository.create({
            batch: { uuid: batchUuid },
            user: { uuid: userId },
            role: AuctionAssigneeRoleEnum.MarketingStaff,
          }),
        );
      }
      for (const userId of dto.auctionStaffIds ?? []) {
        await this.batchAssigneeRepository.save(
          this.batchAssigneeRepository.create({
            batch: { uuid: batchUuid },
            user: { uuid: userId },
            role: AuctionAssigneeRoleEnum.AuctionStaff,
          }),
        );
      }
    }
    batch.updatedBy = updatedByUserId;
    await this.batchRepository.save(batch);
    return this.findOne(batchUuid, userPtId);
  }

  async updateBatchMarketing(
    batchUuid: string,
    dto: UpdateBatchMarketingDto,
    userPtId?: string,
  ): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    if (dto.marketingNotes !== undefined) {
      batch.marketingNotes = dto.marketingNotes ?? null;
    }
    if (dto.marketingAssets !== undefined) {
      batch.marketingAssets = dto.marketingAssets ?? null;
    }
    await this.batchRepository.save(batch);
    return this.findOne(batchUuid, userPtId);
  }

  async updateBatchItemMarketing(
    batchUuid: string,
    itemUuid: string,
    dto: UpdateBatchItemMarketingDto,
    userPtId?: string,
  ): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    const batchItem = await this.batchItemRepository.findOne({
      where: { uuid: itemUuid, auctionBatchId: batchUuid },
    });
    if (!batchItem) {
      throw new NotFoundException('Auction batch item not found');
    }
    if (dto.marketingNotes !== undefined) {
      batchItem.marketingNotes = dto.marketingNotes ?? null;
    }
    if (dto.marketingAssets !== undefined) {
      batchItem.marketingAssets = dto.marketingAssets ?? null;
    }
    await this.batchItemRepository.save(batchItem);
    return this.findOne(batchUuid, userPtId);
  }

  async updateItemPickup(
    batchUuid: string,
    itemUuid: string,
    dto: UpdatePickupDto,
    userId: string,
    userPtId?: string,
  ): Promise<AuctionBatchDto> {
    const batchItem = await this.batchItemRepository.findOne({
      where: { uuid: itemUuid, auctionBatchId: batchUuid },
    });
    if (!batchItem) {
      throw new NotFoundException('Auction batch item not found');
    }
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
      relations: ['items'],
    });
    if (!batch || batch.status !== AuctionBatchStatusEnum.PickupInProgress) {
      throw new BadRequestException(
        'Batch not found or not in pickup_in_progress',
      );
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    if (batchItem.pickupStatus !== AuctionPickupStatusEnum.Pending) {
      throw new BadRequestException(
        'Only items with pending pickup status can be updated',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      batchItem.pickupStatus = dto.pickupStatus;
      batchItem.failureReason =
        dto.pickupStatus === AuctionPickupStatusEnum.Failed
          ? dto.failureReason ?? null
          : null;
      batchItem.updatedBy = userId;
      await manager.save(AuctionBatchItemEntity, batchItem);

      const allItems = await manager.find(AuctionBatchItemEntity, {
        where: { auctionBatchId: batchUuid },
      });
      const allHaveResult = allItems.every(
        (i) => i.pickupStatus !== AuctionPickupStatusEnum.Pending,
      );
      if (allHaveResult) {
        batch.status = AuctionBatchStatusEnum.ValidationPending;
        batch.updatedBy = userId;
        await manager.save(AuctionBatchEntity, batch);
      }

      return this.findOne(batchUuid, userPtId);
    });
  }

  async submitItemValidation(
    batchUuid: string,
    itemUuid: string,
    dto: SubmitValidationDto,
    userId: string,
    userPtId?: string,
  ): Promise<AuctionBatchDto> {
    const batchItem = await this.batchItemRepository.findOne({
      where: { uuid: itemUuid, auctionBatchId: batchUuid },
    });
    if (!batchItem) {
      throw new NotFoundException('Auction batch item not found');
    }
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch || batch.status !== AuctionBatchStatusEnum.ValidationPending) {
      throw new BadRequestException(
        'Batch not found or not in validation_pending',
      );
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    if (batchItem.validationVerdict != null) {
      throw new BadRequestException(
        'Item has already been validated; re-validation is not allowed',
      );
    }

    batchItem.validationVerdict = dto.verdict;
    batchItem.validationNotes = dto.notes ?? null;
    batchItem.validationPhotos = dto.validationPhotos ?? null;
    batchItem.validatedBy = userId;
    batchItem.validatedAt = new Date();
    batchItem.updatedBy = userId;
    await this.batchItemRepository.save(batchItem);

    return this.findOne(batchUuid, userPtId);
  }

  async finalizeBatch(
    batchUuid: string,
    userPtId?: string,
    updatedByUserId?: string,
  ): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
      relations: ['items'],
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    if (batch.status !== AuctionBatchStatusEnum.ValidationPending) {
      throw new BadRequestException(
        'Only validation_pending batches can be finalized',
      );
    }
    const items = await this.batchItemRepository.find({
      where: { auctionBatchId: batchUuid },
      relations: ['spkItem'],
    });
    const allValidated = items.every((i) => i.validationVerdict != null);
    if (!allValidated) {
      throw new BadRequestException(
        'All items must have a validation verdict before finalizing',
      );
    }

    const okItemIds = items
      .filter((bi) => bi.validationVerdict === AuctionValidationVerdictEnum.Ok && bi.spkItemId)
      .map((bi) => bi.spkItemId);

    return this.dataSource.transaction(async (manager) => {
      batch.status = AuctionBatchStatusEnum.ReadyForAuction;
      batch.updatedBy = updatedByUserId ?? null;
      await manager.save(AuctionBatchEntity, batch);

      if (okItemIds.length > 0) {
        await this.spkService.markSpkItemsAsInAuction(okItemIds);
      }
    }).then(async () => {
      // Notify assigned staff that batch is ready for auction (FR-247)
      try {
        const assignees = await this.batchAssigneeRepository.find({
          where: { batch: { uuid: batchUuid } },
          relations: ['user'],
        });
        const batchCode = batch.batchCode ?? batchUuid;
        for (const a of assignees) {
          const recipientId = (a.user as { uuid?: string })?.uuid;
          if (recipientId) {
            await this.notificationService.create({
              recipientId,
              title: 'Batch siap lelang',
              body: `Batch ${batchCode} telah tervalidasi dan siap lelang.`,
              type: 'info',
              relatedEntityType: 'auction_batch',
              relatedEntityId: batchUuid,
              ptId: batch.ptId ?? undefined,
            });
          }
        }
      } catch (err) {
        this.logger.warn(
          `Failed to create finalize notifications for batch ${batchUuid}: ${err}`,
        );
      }
      return this.findOne(batchUuid, userPtId);
    });
  }

  async cancel(
    batchUuid: string,
    userPtId?: string,
    updatedByUserId?: string,
  ): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    if (
      batch.status === AuctionBatchStatusEnum.ReadyForAuction ||
      batch.status === AuctionBatchStatusEnum.Cancelled
    ) {
      throw new BadRequestException(
        'Batch cannot be cancelled in current status',
      );
    }
    batch.status = AuctionBatchStatusEnum.Cancelled;
    batch.updatedBy = updatedByUserId ?? null;
    await this.batchRepository.save(batch);
    return this.findOne(batchUuid, userPtId);
  }

  async remove(
    batchUuid: string,
    userPtId?: string,
  ): Promise<void> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    if (batch.status !== AuctionBatchStatusEnum.Draft) {
      throw new BadRequestException(
        'Only draft batches can be deleted',
      );
    }
    await this.batchAssigneeRepository
      .createQueryBuilder()
      .delete()
      .where('auction_batch_id = :batchUuid', { batchUuid })
      .execute();
    await this.batchItemRepository
      .createQueryBuilder()
      .delete()
      .where('auction_batch_id = :batchUuid', { batchUuid })
      .execute();
    await this.batchRepository.delete({ uuid: batchUuid });
  }

  async removeItemFromBatch(
    batchUuid: string,
    batchItemUuid: string,
    userPtId?: string,
  ): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (userPtId != null && batch.ptId !== userPtId) {
      throw new ForbiddenException('Access denied to this auction batch');
    }
    if (
      batch.status !== AuctionBatchStatusEnum.Draft &&
      batch.status !== AuctionBatchStatusEnum.PickupInProgress
    ) {
      throw new BadRequestException(
        'Item can only be removed from draft or pickup_in_progress batches',
      );
    }
    const batchItem = await this.batchItemRepository.findOne({
      where: { uuid: batchItemUuid, auctionBatchId: batchUuid },
    });
    if (!batchItem) {
      throw new NotFoundException('Auction batch item not found');
    }
    await this.batchItemRepository.delete({
      uuid: batchItemUuid,
      auctionBatchId: batchUuid,
    });
    return this.findOne(batchUuid, userPtId);
  }

  private async generateBatchCode(): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let candidate = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 100) {
      const random = Math.floor(1000 + Math.random() * 9000);
      candidate = `AB-${datePart}-${random}`;
      const found = await this.batchRepository.findOne({
        where: { batchCode: candidate },
      });
      exists = !!found;
      attempts++;
    }
    if (exists || !candidate) {
      throw new BadRequestException('Could not generate unique batch code');
    }
    return candidate;
  }
}
