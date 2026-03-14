import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { BranchEntity } from './entities/branch.entity';
import { BranchDto } from './dto/branch.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchListView, QueryBranchDto } from './dto/query-branch.dto';
import { BranchStatusEnum } from '../../constants/branch-status';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { BorrowRequestService } from '../borrow-request/borrow-request.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    private borrowRequestService: BorrowRequestService,
  ) {}

  async findAll(
    queryDto: QueryBranchDto,
    userCompanyId?: string,
    userId?: string,
  ): Promise<{
    data: BranchDto[];
    meta: PageMetaDto;
  }> {
    const where: FindOptionsWhere<BranchEntity> = {};

    if (queryDto.view === BranchListView.BorrowedByMe && userId) {
      where.actualOwnerId = userId;
    } else if (userCompanyId) {
      where.companyId = userCompanyId;
    }
    if (queryDto.city) {
      where.city = queryDto.city;
    }
    if (queryDto.status) {
      where.status = queryDto.status as any;
    }

    const qbOptions: QueryBuilderOptionsType<BranchEntity> = {
      ...queryDto,
      where,
      orderBy: sortAttribute(queryDto.sortBy, {
        branchCode: { branchCode: true },
        shortName: { shortName: true },
        fullName: { fullName: true },
        city: { city: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.branchRepository.metadata);
    const [branches, count] = await dynamicQueryBuilder.buildDynamicQuery(
      BranchEntity.createQueryBuilder('branch'),
      qbOptions,
    );

    const data = branches.map((branch) => new BranchDto(branch));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });

    return { data, meta };
  }

  async findOne(uuid: string): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({
      where: { uuid },
      relations: ['company', 'actualOwner', 'approver'],
    });

    if (!branch) {
      throw new NotFoundException(`Branch with UUID ${uuid} not found`);
    }

    return new BranchDto(branch);
  }

  async create(
    createDto: CreateBranchDto,
    ownerId: string,
    userCompanyId?: string,
  ): Promise<BranchDto> {
    // Check if branchCode already exists (among non-deleted)
    const existing = await this.branchRepository.findOne({
      where: { branchCode: createDto.branchCode },
    });

    if (existing) {
      throw new BadRequestException(
        `Branch with code ${createDto.branchCode} already exists`,
      );
    }

    // Pinjam PT: explicit flags from client, or branch under a different PT than current user's
    const isPinjamPTByRequest =
      !!createDto.isBorrowed && !!createDto.actualOwnerId;
    const isPinjamPTByCompany =
      !!userCompanyId &&
      !!createDto.companyId &&
      createDto.companyId !== userCompanyId;
    const isPinjamPT = isPinjamPTByRequest || isPinjamPTByCompany;
    const actualOwnerId = isPinjamPT
      ? (createDto.actualOwnerId ?? ownerId)
      : null;

    const branch = this.branchRepository.create({
      ...createDto,
      imageUrl: createDto.imageUrl ?? null,
      isBorrowed: isPinjamPT,
      actualOwnerId,
      status: isPinjamPT
        ? BranchStatusEnum.PendingApproval
        : BranchStatusEnum.Active,
      transactionSequence: 0,
    });

    const saved = await this.branchRepository.save(branch);

    if (
      isPinjamPT &&
      saved.uuid &&
      createDto.companyId &&
      (actualOwnerId ?? createDto.actualOwnerId)
    ) {
      await this.borrowRequestService.create(
        {
          branchId: saved.uuid,
          targetCompanyId: createDto.companyId,
        },
        actualOwnerId ?? createDto.actualOwnerId!,
      );
    }

    return new BranchDto(saved);
  }

  async update(uuid: string, updateDto: UpdateBranchDto): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({
      where: { uuid },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with UUID ${uuid} not found`);
    }

    Object.assign(branch, updateDto);
    const updated = await this.branchRepository.save(branch);

    return new BranchDto(updated);
  }

  async remove(uuid: string, deletedBy?: string | null): Promise<void> {
    const branch = await this.branchRepository.findOne({
      where: { uuid },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with UUID ${uuid} not found`);
    }

    branch.deletedAt = new Date();
    branch.deletedBy = deletedBy ?? null;
    await this.branchRepository.save(branch);
  }

  async approveBorrowRequest(
    branchUuid: string,
    approverId: string,
  ): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({
      where: { uuid: branchUuid },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with UUID ${branchUuid} not found`);
    }

    if (branch.status !== BranchStatusEnum.PendingApproval) {
      throw new BadRequestException('Branch is not pending approval');
    }

    branch.status = BranchStatusEnum.Active;
    branch.approvedBy = approverId;
    branch.approvedAt = new Date();

    const updated = await this.branchRepository.save(branch);
    return new BranchDto(updated);
  }

  async rejectBorrowRequest(
    branchUuid: string,
    approverId: string,
    rejectionReason: string,
  ): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({
      where: { uuid: branchUuid },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with UUID ${branchUuid} not found`);
    }

    if (branch.status !== BranchStatusEnum.PendingApproval) {
      throw new BadRequestException('Branch is not pending approval');
    }

    branch.status = BranchStatusEnum.Inactive;
    branch.approvedBy = approverId;
    branch.approvedAt = new Date();
    branch.rejectionReason = rejectionReason;

    const updated = await this.branchRepository.save(branch);
    return new BranchDto(updated);
  }

  async deactivate(uuid: string): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({
      where: { uuid },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with UUID ${uuid} not found`);
    }
    if (branch.status !== BranchStatusEnum.Active) {
      throw new BadRequestException(
        'Only active branches can be deactivated',
      );
    }
    branch.status = BranchStatusEnum.Inactive;
    await this.branchRepository.save(branch);
    return this.findOne(uuid);
  }

  async activate(uuid: string): Promise<BranchDto> {
    const branch = await this.branchRepository.findOne({
      where: { uuid },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with UUID ${uuid} not found`);
    }
    if (branch.status !== BranchStatusEnum.Inactive) {
      throw new BadRequestException(
        'Only inactive branches can be activated',
      );
    }
    branch.status = BranchStatusEnum.Active;
    await this.branchRepository.save(branch);
    return this.findOne(uuid);
  }
}
