import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, IsNull, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { CapitalTopupStatusEnum } from '../../constants/capital-topup-status';
import { CashMutationService } from '../cash-mutation/cash-mutation.service';
import { NotificationService } from '../notification/notification.service';
import { UserEntity } from '../user/entities/user.entity';
import { CapitalTopupEntity } from './entities/capital-topup.entity';
import { CapitalTopupDto } from './dto/capital-topup.dto';
import { CreateCapitalTopupDto } from './dto/create-capital-topup.dto';
import { UpdateCapitalTopupDto } from './dto/update-capital-topup.dto';
import { QueryCapitalTopupDto } from './dto/query-capital-topup.dto';
import { RejectCapitalTopupDto } from './dto/reject-capital-topup.dto';
import { DisburseCapitalTopupDto } from './dto/disburse-capital-topup.dto';

@Injectable()
export class CapitalTopupService {
  private readonly logger = new Logger(CapitalTopupService.name);

  constructor(
    @InjectRepository(CapitalTopupEntity)
    private capitalTopupRepository: Repository<CapitalTopupEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private cashMutationService: CashMutationService,
    private notificationService: NotificationService,
  ) {}

  async findAll(
    queryDto: QueryCapitalTopupDto,
    userPtId?: string,
  ): Promise<{ data: CapitalTopupDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<CapitalTopupEntity> = {
      deletedAt: IsNull(),
    };

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

    const qbOptions: QueryBuilderOptionsType<CapitalTopupEntity> = {
      ...queryDto,
      relation: {
        store: true,
        pt: true,
        requester: true,
      },
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        createdAt: { createdAt: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.capitalTopupRepository.metadata);
    const [records, count] = await dynamicQueryBuilder.buildDynamicQuery(
      CapitalTopupEntity.createQueryBuilder('topup'),
      qbOptions,
    );
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

  /**
   * Staff Toko submits a capital topup request.
   * Notifies all Admin PT users of the PT.
   */
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

    // Notify Admin PT users
    void this.notifyAdminPt(createDto.ptId, saved.uuid, topupCode, createDto.amount);

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

  /**
   * Soft-delete a pending capital topup.
   */
  async delete(uuid: string, deletedBy?: string | null): Promise<void> {
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
        'Only pending topup requests can be deleted',
      );
    }
    topup.deletedAt = new Date();
    topup.deletedBy = deletedBy ?? null;
    await this.capitalTopupRepository.save(topup);
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

  /**
   * Admin PT uploads disbursement proof — marks topup as Disbursed ("Selesai"),
   * auto-creates Credit mutation for the store, and notifies the requester.
   */
  async disburse(
    uuid: string,
    dto: DisburseCapitalTopupDto,
    disbursedBy: string,
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

    // Auto-create Credit mutation for the store
    try {
      await this.cashMutationService.createFromTopupDisbursement(
        topup.ptId,
        topup.storeId,
        Number(topup.amount),
        topup.uuid,
        disbursedBy,
      );
    } catch (err) {
      this.logger.error(`Failed to create mutation for topup ${topup.topupCode}: ${err}`);
    }

    // Notify the staff who requested it
    void this.notifyRequester(topup.requestedBy, topup.ptId, topup.uuid, topup.topupCode, Number(topup.amount));

    return this.findOne(uuid);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async notifyAdminPt(
    ptId: string,
    topupId: string,
    topupCode: string,
    amount: number,
  ): Promise<void> {
    try {
      const adminUsers = await this.userRepository
        .createQueryBuilder('u')
        .innerJoin('u.roles', 'r')
        .where('u.companyId = :ptId', { ptId })
        .andWhere('r.code = :code', { code: 'company_admin' })
        .select(['u.uuid'])
        .getMany();

      const formatted = new Intl.NumberFormat('id-ID').format(amount);
      for (const user of adminUsers) {
        await this.notificationService.create({
          recipientId: user.uuid,
          ptId,
          title: 'Request Tambah Modal Baru',
          body: `Ada permintaan tambah modal sebesar Rp ${formatted} dari toko. Silakan ditindaklanjuti.`,
          type: 'tambah_modal',
          relatedEntityType: 'capital_topup',
          relatedEntityId: topupId,
        });
      }
    } catch (err) {
      this.logger.error(`Failed to notify admin PT for topup ${topupCode}: ${err}`);
    }
  }

  private async notifyRequester(
    requestedBy: string,
    ptId: string,
    topupId: string,
    topupCode: string,
    amount: number,
  ): Promise<void> {
    try {
      const formatted = new Intl.NumberFormat('id-ID').format(amount);
      await this.notificationService.create({
        recipientId: requestedBy,
        ptId,
        title: 'Tambah Modal Selesai',
        body: `Permintaan tambah modal Rp ${formatted} (${topupCode}) telah diproses. Dana sudah dikirim ke toko.`,
        type: 'tambah_modal',
        relatedEntityType: 'capital_topup',
        relatedEntityId: topupId,
      });
    } catch (err) {
      this.logger.error(`Failed to notify requester for topup ${topupCode}: ${err}`);
    }
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
