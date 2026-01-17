import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BorrowRequestEntity } from './entities/borrow-request.entity';
import { BorrowRequestDto } from './dto/borrow-request.dto';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { BorrowRequestStatusEnum } from '../../constants/borrow-request-status';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Injectable()
export class BorrowRequestService {
  constructor(
    @InjectRepository(BorrowRequestEntity)
    private borrowRequestRepository: Repository<BorrowRequestEntity>,
  ) {}

  async findAll(options: PageOptionsDto, requesterId?: string, targetCompanyId?: string): Promise<{
    data: BorrowRequestDto[];
    meta: PageMetaDto;
  }> {
    const query = this.borrowRequestRepository.createQueryBuilder('request');

    if (requesterId) {
      query.andWhere('request.requesterId = :requesterId', { requesterId });
    }

    if (targetCompanyId) {
      query.andWhere('request.targetCompanyId = :targetCompanyId', { targetCompanyId });
    }

    query.orderBy('request.createdAt', 'DESC');
    query.skip(options.skip || 0);
    query.take(options.pageSize || 10);

    const [requests, count] = await query.getManyAndCount();

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
    return new BorrowRequestDto(updated);
  }
}
