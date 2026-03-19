import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  type FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { BranchEntity } from '../branch/entities/branch.entity';
import { UserEntity } from '../user/entities/user.entity';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { CashDepositStatusEnum } from '../../constants/cash-deposit-status';
import { CashMutationService } from '../cash-mutation/cash-mutation.service';
import { NotificationService } from '../notification/notification.service';
import { XenditService } from '../xendit/xendit.service';
import { CashDepositEntity } from './entities/cash-deposit.entity';
import { CashDepositDto } from './dto/cash-deposit.dto';
import { CreateCashDepositDto } from './dto/create-cash-deposit.dto';
import { QueryCashDepositDto } from './dto/query-cash-deposit.dto';

/** WIB UTC+7 offset in milliseconds */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

@Injectable()
export class CashDepositService {
  private readonly logger = new Logger(CashDepositService.name);

  constructor(
    @InjectRepository(CashDepositEntity)
    private cashDepositRepository: Repository<CashDepositEntity>,
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private xenditService: XenditService,
    private cashMutationService: CashMutationService,
    private notificationService: NotificationService,
  ) {}

  async findAll(
    queryDto: QueryCashDepositDto,
    userPtId?: string,
  ): Promise<{ data: CashDepositDto[]; meta: PageMetaDto }> {
    const where: FindOptionsWhere<CashDepositEntity> = {};

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
    if (queryDto.dateFrom || queryDto.dateTo) {
      if (queryDto.dateFrom && queryDto.dateTo) {
        const dateToEnd = new Date(queryDto.dateTo);
        dateToEnd.setHours(23, 59, 59, 999);
        where.createdAt = Between(
          new Date(queryDto.dateFrom),
          dateToEnd,
        ) as any;
      } else if (queryDto.dateFrom) {
        where.createdAt = MoreThanOrEqual(new Date(queryDto.dateFrom)) as any;
      } else {
        const dateToEnd = new Date(queryDto.dateTo!);
        dateToEnd.setHours(23, 59, 59, 999);
        where.createdAt = LessThanOrEqual(dateToEnd) as any;
      }
    }

    const qbOptions: QueryBuilderOptionsType<CashDepositEntity> = {
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

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.cashDepositRepository.metadata);
    const [records, count] = await dynamicQueryBuilder.buildDynamicQuery(
      CashDepositEntity.createQueryBuilder('deposit'),
      qbOptions,
    );
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
      relations: ['store', 'pt', 'requester'],
    });
    if (!record) {
      throw new NotFoundException(`Cash deposit with UUID ${uuid} not found`);
    }
    return new CashDepositDto(record);
  }

  /**
   * Create a deposit request (called by Admin PT).
   * Generates a Xendit Fixed VA and notifies the branch's Staff Toko.
   */
  async create(
    createDto: CreateCashDepositDto,
    requestedBy: string,
  ): Promise<CashDepositDto> {
    // Resolve ptId from branch if not provided
    let ptId = createDto.ptId;
    if (!ptId) {
      const store = await this.branchRepository.findOne({
        where: { uuid: createDto.storeId },
      });
      if (!store) {
        throw new NotFoundException('Store (branch) not found');
      }
      ptId = store.companyId;
    }

    // Enforce one-pending-per-branch rule
    const existingPending = await this.cashDepositRepository.findOne({
      where: { storeId: createDto.storeId, status: CashDepositStatusEnum.Pending },
    });
    if (existingPending) {
      throw new BadRequestException(
        'Cabang ini sudah memiliki permintaan setor uang yang masih pending. Harap selesaikan terlebih dahulu.',
      );
    }

    // Calculate expiry = end of today in WIB (23:59:59)
    const now = new Date();
    const nowWib = new Date(now.getTime() + WIB_OFFSET_MS);
    const expiresAt = new Date(
      Date.UTC(
        nowWib.getUTCFullYear(),
        nowWib.getUTCMonth(),
        nowWib.getUTCDate(),
        16, // 23:59:59 WIB = 16:59:59 UTC
        59,
        59,
        0,
      ),
    );

    const depositCode = await this.generateDepositCode();

    // Create Xendit Fixed Virtual Account
    const va = await this.xenditService.createFixedVirtualAccount(
      depositCode,
      createDto.amount,
      expiresAt,
    );

    const deposit = this.cashDepositRepository.create({
      depositCode,
      storeId: createDto.storeId,
      ptId,
      amount: String(createDto.amount),
      virtualAccount: va.vaNumber,
      xenditExternalId: va.xenditId,
      status: CashDepositStatusEnum.Pending,
      expiresAt,
      requestedBy,
      notes: createDto.notes ?? null,
    });
    const saved = await this.cashDepositRepository.save(deposit);

    // Notify Staff Toko of the branch
    void this.notifyBranchStaff(createDto.storeId, ptId, saved.uuid, depositCode, createDto.amount);

    return this.findOne(saved.uuid);
  }

  /**
   * Process Xendit webhook callback for VA payment.
   * Verifies the token, matches external_id, updates status to Lunas,
   * and records cash mutations.
   */
  async webhook(
    payload: Record<string, unknown>,
    callbackToken: string,
  ): Promise<{ received: boolean }> {
    if (!this.xenditService.verifyWebhookToken(callbackToken)) {
      throw new UnauthorizedException('Invalid Xendit callback token');
    }

    const externalId = payload['external_id'] as string | undefined;
    const paidAmount = payload['amount'] as number | undefined;

    if (!externalId) {
      this.logger.warn('Xendit webhook received without external_id');
      return { received: true };
    }

    const deposit = await this.cashDepositRepository.findOne({
      where: { xenditExternalId: externalId },
    });

    if (!deposit) {
      this.logger.warn(`Xendit webhook: no deposit found for xenditExternalId=${externalId}`);
      return { received: true };
    }

    if (deposit.status !== CashDepositStatusEnum.Pending) {
      this.logger.log(`Deposit ${deposit.depositCode} already processed, skipping webhook`);
      return { received: true };
    }

    // Update status to Lunas
    deposit.status = CashDepositStatusEnum.Lunas;
    await this.cashDepositRepository.save(deposit);

    // Auto-record cash mutations
    const amount = paidAmount ?? Number(deposit.amount);
    try {
      await this.cashMutationService.createFromDepositPayment(
        deposit.ptId,
        deposit.storeId,
        amount,
        deposit.uuid,
        deposit.requestedBy,
      );
    } catch (err) {
      this.logger.error(`Failed to create mutation for deposit ${deposit.depositCode}: ${err}`);
    }

    // Notify branch staff that payment was received
    void this.notifyBranchStaffPaid(deposit.storeId, deposit.ptId, deposit.uuid, deposit.depositCode);

    this.logger.log(`Deposit ${deposit.depositCode} marked as Lunas via webhook`);
    return { received: true };
  }

  /**
   * Expire all pending deposits where expiresAt < now (called by scheduler).
   */
  async expirePendingDeposits(): Promise<number> {
    const result = await this.cashDepositRepository
      .createQueryBuilder()
      .update(CashDepositEntity)
      .set({ status: CashDepositStatusEnum.Expired })
      .where('status = :status', { status: CashDepositStatusEnum.Pending })
      .andWhere('expires_at < :now', { now: new Date() })
      .execute();
    return result.affected ?? 0;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async notifyBranchStaff(
    storeId: string,
    ptId: string,
    depositId: string,
    depositCode: string,
    amount: number,
  ): Promise<void> {
    try {
      const staffUsers = await this.userRepository.find({
        where: { branchId: storeId },
        select: ['uuid'],
      });
      const formatted = new Intl.NumberFormat('id-ID').format(amount);
      for (const user of staffUsers) {
        await this.notificationService.create({
          recipientId: user.uuid,
          ptId,
          title: 'Permintaan Setor Uang',
          body: `Admin PT membuat permintaan setor uang sebesar Rp ${formatted}. Silakan transfer ke nomor VA yang tertera.`,
          type: 'setor_uang',
          relatedEntityType: 'cash_deposit',
          relatedEntityId: depositId,
        });
      }
    } catch (err) {
      this.logger.error(`Failed to notify branch staff for deposit ${depositCode}: ${err}`);
    }
  }

  private async notifyBranchStaffPaid(
    storeId: string,
    ptId: string,
    depositId: string,
    depositCode: string,
  ): Promise<void> {
    try {
      const staffUsers = await this.userRepository.find({
        where: { branchId: storeId },
        select: ['uuid'],
      });
      for (const user of staffUsers) {
        await this.notificationService.create({
          recipientId: user.uuid,
          ptId,
          title: 'Setor Uang Berhasil',
          body: `Pembayaran setor uang ${depositCode} telah berhasil dikonfirmasi. Status: Lunas.`,
          type: 'setor_uang',
          relatedEntityType: 'cash_deposit',
          relatedEntityId: depositId,
        });
      }
    } catch (err) {
      this.logger.error(`Failed to notify branch staff for paid deposit ${depositCode}: ${err}`);
    }
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
