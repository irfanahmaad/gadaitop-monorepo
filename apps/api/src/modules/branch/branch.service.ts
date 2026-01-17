import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BranchEntity } from './entities/branch.entity';
import { BranchDto } from './dto/branch.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { QueryBranchDto } from './dto/query-branch.dto';
import { BranchStatusEnum } from '../../constants/branch-status';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

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
    const query = this.branchRepository.createQueryBuilder('branch');

    if (userCompanyId) {
      query.where('branch.companyId = :companyId', { companyId: userCompanyId });
    }

    if (queryDto.city) {
      query.andWhere('branch.city = :city', { city: queryDto.city });
    }

    if (queryDto.status) {
      query.andWhere('branch.status = :status', { status: queryDto.status });
    }

    if (queryDto.search) {
      query.andWhere(
        '(branch.branchCode ILIKE :search OR branch.shortName ILIKE :search OR branch.fullName ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    if (queryDto.sortBy) {
      query.orderBy(`branch.${queryDto.sortBy}`, queryDto.order || 'ASC');
    } else {
      query.orderBy('branch.createdAt', 'DESC');
    }

    query.skip(queryDto.skip || 0);
    query.take(queryDto.pageSize || 10);

    const [branches, count] = await query.getManyAndCount();

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
