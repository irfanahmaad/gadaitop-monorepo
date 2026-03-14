import { type FindOptionsWhere, Repository } from 'typeorm';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
} from '../../common/helpers/query-builder';
import { BranchStatusEnum } from '../../constants/branch-status';
import { BorrowRequestStatusEnum } from '../../constants/borrow-request-status';
import { NotificationService } from '../notification/notification.service';
import { UserService } from '../user/user.service';
import { QueryUserDto } from '../user/dtos/query-user.dto';
import { BorrowRequestListView } from './dto/query-borrow-request.dto';
import { BorrowRequestDto } from './dto/borrow-request.dto';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { BorrowRequestEntity } from './entities/borrow-request.entity';

/** relatedEntityType for notifications linking to a borrow request */
const NOTIFICATION_RELATED_ENTITY_BORROW_REQUEST = 'BorrowRequest';

@Injectable()
export class BorrowRequestService {
  constructor(
    @InjectRepository(BorrowRequestEntity)
    private borrowRequestRepository: Repository<BorrowRequestEntity>,
    private notificationService: NotificationService,
    private userService: UserService,
  ) {}

  async findAll(
    options: PageOptionsDto,
    requesterId?: string,
    targetCompanyId?: string,
    view?: 'incoming' | 'outgoing',
  ): Promise<{
    data: BorrowRequestDto[];
    meta: PageMetaDto;
  }> {
    const where: FindOptionsWhere<BorrowRequestEntity> = {};

    if (view === BorrowRequestListView.Incoming && targetCompanyId) {
      where.targetCompanyId = targetCompanyId;
    } else if (view === BorrowRequestListView.Outgoing && requesterId) {
      where.requesterId = requesterId;
    } else {
      if (requesterId) {
        where.requesterId = requesterId;
      }
      if (targetCompanyId) {
        where.targetCompanyId = targetCompanyId;
      }
    }

    const qbOptions: QueryBuilderOptionsType<BorrowRequestEntity> = {
      ...options,
      where,
      orderBy: { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.borrowRequestRepository.metadata);
    const [requests, count] = await dynamicQueryBuilder.buildDynamicQuery(
      BorrowRequestEntity.createQueryBuilder('request'),
      qbOptions,
    );

    const data = requests.map((request) => new BorrowRequestDto(request));
    const meta = new PageMetaDto({ pageOptionsDto: options, itemCount: count });

    return { data, meta };
  }

  async findOne(uuid: string): Promise<BorrowRequestDto> {
    const request = await this.borrowRequestRepository.findOne({
      where: { uuid },
      relations: ['branch', 'requester', 'targetCompany', 'processor'],
    });

    if (!request) {
      throw new NotFoundException(`Borrow request with UUID ${uuid} not found`);
    }

    return new BorrowRequestDto(request);
  }

  async create(createDto: CreateBorrowRequestDto, requesterId: string): Promise<BorrowRequestDto> {
    // Check if request already exists for this branch
    const existing = await this.borrowRequestRepository.findOne({
      where: {
        branchId: createDto.branchId,
        status: BorrowRequestStatusEnum.Pending,
      },
    });

    if (existing) {
      throw new BadRequestException('A pending borrow request already exists for this branch');
    }

    const request = this.borrowRequestRepository.create({
      ...createDto,
      requesterId,
      status: BorrowRequestStatusEnum.Pending,
    });

    const saved = await this.borrowRequestRepository.save(request);

    // Notify target PT admins (AC-4.5.4)
    try {
      const withRelations = await this.borrowRequestRepository.findOne({
        where: { uuid: saved.uuid },
        relations: ['branch', 'requester', 'targetCompany'],
      });
      if (withRelations?.targetCompanyId) {
        const queryDto = Object.assign(new QueryUserDto(), {
          companyId: withRelations.targetCompanyId,
          roleCode: 'company_admin',
          page: 1,
          pageSize: 50,
        });
        const { data: admins } = await this.userService.findAll(queryDto);
        const branchName =
          (withRelations.branch as { shortName?: string })?.shortName ?? 'Toko';
        const requesterName =
          (withRelations.requester as { fullName?: string })?.fullName ??
          (withRelations.requester as { email?: string })?.email ??
          'Pemohon';
        const title = 'Permintaan Pinjam Toko';
        const body = `${requesterName} mengajukan permintaan pinjam toko: ${branchName}.`;
        for (const admin of admins) {
          await this.notificationService.create({
            recipientId: admin.uuid,
            title,
            body,
            type: 'info',
            ptId: withRelations.targetCompanyId,
            relatedEntityType: NOTIFICATION_RELATED_ENTITY_BORROW_REQUEST,
            relatedEntityId: saved.uuid,
          });
        }
      }
    } catch (err) {
      // Don't fail create if notification fails
      console.error('Borrow request create: failed to notify target PT admins', err);
    }

    return new BorrowRequestDto(saved);
  }

  async approve(uuid: string, processorId: string): Promise<BorrowRequestDto> {
    const request = await this.borrowRequestRepository.findOne({
      where: { uuid },
      relations: ['branch'],
    });

    if (!request) {
      throw new NotFoundException(`Borrow request with UUID ${uuid} not found`);
    }

    if (request.status !== BorrowRequestStatusEnum.Pending) {
      throw new BadRequestException('Request is not pending');
    }

    request.status = BorrowRequestStatusEnum.Approved;
    request.processedBy = processorId;
    request.processedAt = new Date();

    // Update branch status
    if (request.branch) {
      request.branch.status = 'active' as any;
      request.branch.isBorrowed = true;
      await this.borrowRequestRepository.manager.save(request.branch);
    }

    const updated = await this.borrowRequestRepository.save(request);

    // Notify requester (AC-4.6.4)
    try {
      await this.notificationService.create({
        recipientId: request.requesterId,
        title: 'Permintaan Pinjam Toko Disetujui',
        body: 'Permintaan pinjam toko Anda telah disetujui.',
        type: 'info',
        ptId: request.targetCompanyId ?? undefined,
        relatedEntityType: NOTIFICATION_RELATED_ENTITY_BORROW_REQUEST,
        relatedEntityId: request.uuid,
      });
    } catch (err) {
      console.error('Borrow request approve: failed to notify requester', err);
    }

    return new BorrowRequestDto(updated);
  }

  async reject(
    uuid: string,
    processorId: string,
    rejectionReason: string,
  ): Promise<BorrowRequestDto> {
    const request = await this.borrowRequestRepository.findOne({
      where: { uuid },
      relations: ['branch'],
    });

    if (!request) {
      throw new NotFoundException(`Borrow request with UUID ${uuid} not found`);
    }

    if (request.status !== BorrowRequestStatusEnum.Pending) {
      throw new BadRequestException('Request is not pending');
    }

    request.status = BorrowRequestStatusEnum.Rejected;
    request.processedBy = processorId;
    request.processedAt = new Date();
    request.rejectionReason = rejectionReason;

    // Update branch status
    if (request.branch) {
      request.branch.status = 'inactive' as any;
      request.branch.rejectionReason = rejectionReason;
      await this.borrowRequestRepository.manager.save(request.branch);
    }

    const updated = await this.borrowRequestRepository.save(request);

    // Notify requester with reason (AC-4.6.7)
    try {
      await this.notificationService.create({
        recipientId: request.requesterId,
        title: 'Permintaan Pinjam Toko Ditolak',
        body: `Permintaan pinjam toko Anda ditolak. Alasan: ${rejectionReason ?? 'Tidak disebutkan.'}`,
        type: 'info',
        ptId: request.targetCompanyId ?? undefined,
        relatedEntityType: NOTIFICATION_RELATED_ENTITY_BORROW_REQUEST,
        relatedEntityId: request.uuid,
      });
    } catch (err) {
      console.error('Borrow request reject: failed to notify requester', err);
    }

    return new BorrowRequestDto(updated);
  }

  /**
   * Revoke an approved borrow (main PT only). Ends the borrow: branch becomes inactive.
   */
  async revoke(
    uuid: string,
    processorId: string,
    targetCompanyId: string | undefined,
  ): Promise<BorrowRequestDto> {
    const request = await this.borrowRequestRepository.findOne({
      where: { uuid },
      relations: ['branch'],
    });

    if (!request) {
      throw new NotFoundException(`Borrow request with UUID ${uuid} not found`);
    }

    if (request.status !== BorrowRequestStatusEnum.Approved) {
      throw new BadRequestException('Only approved borrow requests can be revoked');
    }

    if (!targetCompanyId || request.targetCompanyId !== targetCompanyId) {
      throw new ForbiddenException(
        'Only the target PT (main PT) can revoke this borrow request',
      );
    }

    request.status = BorrowRequestStatusEnum.Revoked;
    request.processedBy = processorId;
    request.processedAt = new Date();

    if (request.branch) {
      request.branch.status = BranchStatusEnum.Inactive;
      await this.borrowRequestRepository.manager.save(request.branch);
    }

    const updated = await this.borrowRequestRepository.save(request);
    return new BorrowRequestDto(updated);
  }
}
