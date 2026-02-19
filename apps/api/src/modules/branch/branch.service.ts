import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { BranchEntity } from './entities/branch.entity';
import { BranchDto } from './dto/branch.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { QueryBranchDto } from './dto/query-branch.dto';
import { BranchStatusEnum } from '../../constants/branch-status';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
  ) {}

  async findAll(queryDto: QueryBranchDto, userCompanyId?: string): Promise<{
    data: BranchDto[];
    meta: PageMetaDto;
  }> {
    const where: FindOptionsWhere<BranchEntity> = {};

    if (userCompanyId) {
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
      select: {
        branchCode: true,
        shortName: true,
        fullName: true,
        city: true,
        status: true,
      },
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

  async create(createDto: CreateBranchDto, ownerId: string): Promise<BranchDto> {
    // Check if branchCode already exists
    const existing = await this.branchRepository.findOne({
      where: { branchCode: createDto.branchCode },
    });

    if (existing) {
      throw new BadRequestException(
        `Branch with code ${createDto.branchCode} already exists`,
      );
    }

    const branch = this.branchRepository.create({
      ...createDto,
      status: createDto.isBorrowed
        ? BranchStatusEnum.PendingApproval
        : BranchStatusEnum.Active,
      transactionSequence: 0,
    });

    const saved = await this.branchRepository.save(branch);
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

  async remove(uuid: string): Promise<void> {
    const branch = await this.branchRepository.findOne({
      where: { uuid },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with UUID ${uuid} not found`);
    }

    await this.branchRepository.softDelete({ uuid });
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
}
