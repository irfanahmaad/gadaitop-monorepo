import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { AuctionBatchStatusEnum } from '../../constants/auction-batch-status';
import { AuctionPickupStatusEnum } from '../../constants/auction-pickup-status';
import { AuctionValidationVerdictEnum } from '../../constants/auction-validation-verdict';
import { SpkStatusEnum } from '../../constants/spk-status';
import { SpkItemStatusEnum } from '../../constants/spk-item-status';
import { AuctionBatchEntity } from './entities/auction-batch.entity';
import { AuctionBatchItemEntity } from './entities/auction-batch-item.entity';
import { SpkRecordEntity } from '../spk/entities/spk-record.entity';
import { SpkItemEntity } from '../spk/entities/spk-item.entity';
import { AuctionBatchDto } from './dto/auction-batch.dto';
import { CreateAuctionBatchDto } from './dto/create-auction-batch.dto';
import { QueryAuctionBatchDto } from './dto/query-auction-batch.dto';
import { UpdatePickupDto } from './dto/update-pickup.dto';
import { SubmitValidationDto } from './dto/submit-validation.dto';

@Injectable()
export class AuctionService {
  constructor(
    @InjectRepository(AuctionBatchEntity)
    private batchRepository: Repository<AuctionBatchEntity>,
    @InjectRepository(AuctionBatchItemEntity)
    private batchItemRepository: Repository<AuctionBatchItemEntity>,
    @InjectRepository(SpkRecordEntity)
    private spkRecordRepository: Repository<SpkRecordEntity>,
    @InjectRepository(SpkItemEntity)
    private spkItemRepository: Repository<SpkItemEntity>,
  ) {}

  async findAll(
    queryDto: QueryAuctionBatchDto,
    userPtId?: string,
  ): Promise<{ data: AuctionBatchDto[]; meta: PageMetaDto }> {
    const query = this.batchRepository.createQueryBuilder('batch');

    if (userPtId) {
      query.andWhere('batch.ptId = :ptId', { ptId: userPtId });
    }
    if (queryDto.ptId) {
      query.andWhere('batch.ptId = :ptId', { ptId: queryDto.ptId });
    }
    if (queryDto.storeId) {
      query.andWhere('batch.storeId = :storeId', {
        storeId: queryDto.storeId,
      });
    }
    if (queryDto.status) {
      query.andWhere('batch.status = :status', { status: queryDto.status });
    }
    if (queryDto.assignedTo) {
      query.andWhere('batch.assignedTo = :assignedTo', {
        assignedTo: queryDto.assignedTo,
      });
    }

    if (queryDto.sortBy) {
      query.orderBy(`batch.${queryDto.sortBy}`, queryDto.order || 'DESC');
    } else {
      query.orderBy('batch.createdAt', 'DESC');
    }

    query.skip(queryDto.getSkip());
    const take = queryDto.getTake();
    if (take !== undefined) {
      query.take(take);
    }

    const [batches, count] = await query.getManyAndCount();
    const data = batches.map((b) => new AuctionBatchDto(b));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid },
      relations: ['items', 'items.spkItem'],
    });
    if (!batch) {
      throw new NotFoundException(`Auction batch with UUID ${uuid} not found`);
    }
    return new AuctionBatchDto(batch);
  }

  async create(
    dto: CreateAuctionBatchDto,
    createdBy: string,
  ): Promise<AuctionBatchDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await this.spkItemRepository.find({
      where: { uuid: In(dto.spkItemIds) },
      relations: ['spk'],
    });
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
      if (spk.storeId !== dto.storeId || spk.ptId !== dto.ptId) {
        throw new BadRequestException(
          `SPK item ${item.uuid} does not belong to the given store/PT`,
        );
      }
    }

    const batchCode = await this.generateBatchCode();
    const batch = this.batchRepository.create({
      batchCode,
      storeId: dto.storeId,
      ptId: dto.ptId,
      status: AuctionBatchStatusEnum.Draft,
      notes: dto.notes ?? null,
      createdBy,
    });
    const savedBatch = await this.batchRepository.save(batch);

    const batchItems = dto.spkItemIds.map((spkItemId) =>
      this.batchItemRepository.create({
        auctionBatchId: savedBatch.uuid,
        spkItemId,
        pickupStatus: AuctionPickupStatusEnum.Pending,
      }),
    );
    await this.batchItemRepository.save(batchItems);

    return this.findOne(savedBatch.uuid);
  }

  async assign(batchUuid: string, userId: string): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({ where: { uuid: batchUuid } });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
    }
    if (batch.status !== AuctionBatchStatusEnum.Draft) {
      throw new BadRequestException(
        'Only draft batches can be assigned',
      );
    }
    batch.assignedTo = userId;
    batch.assignedAt = new Date();
    batch.status = AuctionBatchStatusEnum.PickupInProgress;
    await this.batchRepository.save(batch);
    return this.findOne(batchUuid);
  }

  async updateItemPickup(
    batchUuid: string,
    itemUuid: string,
    dto: UpdatePickupDto,
    _userId: string,
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
    batchItem.pickupStatus = dto.pickupStatus;
    batchItem.failureReason =
      dto.pickupStatus === AuctionPickupStatusEnum.Failed
        ? dto.failureReason ?? null
        : null;
    await this.batchItemRepository.save(batchItem);

    const allItems = await this.batchItemRepository.find({
      where: { auctionBatchId: batchUuid },
    });
    const allHaveResult = allItems.every(
      (i) => i.pickupStatus !== AuctionPickupStatusEnum.Pending,
    );
    if (allHaveResult) {
      batch.status = AuctionBatchStatusEnum.ValidationPending;
      await this.batchRepository.save(batch);
    }

    return this.findOne(batchUuid);
  }

  async submitItemValidation(
    batchUuid: string,
    itemUuid: string,
    dto: SubmitValidationDto,
    userId: string,
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
    if (!batch || batch.status !== AuctionBatchStatusEnum.ValidationPending) {
      throw new BadRequestException(
        'Batch not found or not in validation_pending',
      );
    }
    batchItem.validationVerdict = dto.verdict;
    batchItem.validationNotes = dto.notes ?? null;
    batchItem.validationPhotos = dto.validationPhotos ?? null;
    batchItem.validatedBy = userId;
    batchItem.validatedAt = new Date();
    await this.batchItemRepository.save(batchItem);

    return this.findOne(batchUuid);
  }

  async finalizeBatch(batchUuid: string): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
      relations: ['items'],
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
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

    batch.status = AuctionBatchStatusEnum.ReadyForAuction;
    await this.batchRepository.save(batch);

    for (const bi of items) {
      const spkItem = bi.spkItem as SpkItemEntity;
      if (spkItem && bi.validationVerdict === AuctionValidationVerdictEnum.Ok) {
        spkItem.status = SpkItemStatusEnum.InAuction;
        await this.spkItemRepository.save(spkItem);
      }
    }

    return this.findOne(batchUuid);
  }

  async cancel(batchUuid: string): Promise<AuctionBatchDto> {
    const batch = await this.batchRepository.findOne({
      where: { uuid: batchUuid },
    });
    if (!batch) {
      throw new NotFoundException('Auction batch not found');
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
    await this.batchRepository.save(batch);
    return this.findOne(batchUuid);
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
