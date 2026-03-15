import { type FindOptionsWhere, Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { AuditActionEnum } from '../../constants/audit-action';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
} from '../../common/helpers/query-builder';
import { AuditLogDto } from './dto/audit-log.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  /**
   * Log a view action (e.g. batch or item view) for audit trail (FR-258).
   */
  async logView(
    entityName: string,
    entityId: string,
    userId: string | null,
  ): Promise<void> {
    try {
      const log = this.auditLogRepository.create({
        entityName,
        entityId,
        action: AuditActionEnum.View,
        userId,
        oldValues: null,
        newValues: null,
        changedFields: null,
        ipAddress: null,
        userAgent: null,
      });
      await this.auditLogRepository.save(log);
    } catch (err) {
      // Do not fail the request if audit logging fails
      console.error('Audit logView failed:', err);
    }
  }

  async findAll(queryDto: QueryAuditLogDto): Promise<{
    data: AuditLogDto[];
    meta: PageMetaDto;
  }> {
    const where: FindOptionsWhere<AuditLogEntity> = {};

    if (queryDto.entityName) {
      where.entityName = queryDto.entityName;
    }
    if (queryDto.entityId) {
      where.entityId = queryDto.entityId;
    }
    if (queryDto.action) {
      where.action = queryDto.action;
    }
    if (queryDto.userId) {
      where.userId = queryDto.userId;
    }

    const qbOptions: QueryBuilderOptionsType<AuditLogEntity> = {
      ...queryDto,
      where,
      orderBy: { createdAt: 'DESC' } as any,
    };

    // If search is specified, we need a raw join for the user table
    const qb = this.auditLogRepository.createQueryBuilder('audit');
    if (queryDto.search) {
      qb.leftJoin('audit.user', 'user');
      qb.andWhere('user.fullName ILIKE :search', { search: `%${queryDto.search}%` });
    }

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.auditLogRepository.metadata);
    const [logs, count] = await dynamicQueryBuilder.buildDynamicQuery(
      qb,
      qbOptions,
    );

    const data = logs.map((log) => new AuditLogDto(log));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });

    return { data, meta };
  }

  async findOne(uuid: string): Promise<AuditLogDto> {
    const log = await this.auditLogRepository.findOne({
      where: { uuid },
      relations: ['user'],
    });

    if (!log) {
      throw new NotFoundException(`Audit log with UUID ${uuid} not found`);
    }

    return new AuditLogDto(log);
  }

  async export(queryDto: QueryAuditLogDto): Promise<AuditLogDto[]> {
    const query = this.auditLogRepository.createQueryBuilder('audit');

    if (queryDto.entityName) {
      query.andWhere('audit.entityName = :entityName', { entityName: queryDto.entityName });
    }

    if (queryDto.entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId: queryDto.entityId });
    }

    if (queryDto.action) {
      query.andWhere('audit.action = :action', { action: queryDto.action });
    }

    if (queryDto.userId) {
      query.andWhere('audit.userId = :userId', { userId: queryDto.userId });
    }

    query.orderBy('audit.createdAt', 'DESC');

    const logs = await query.getMany();
    return logs.map((log) => new AuditLogDto(log));
  }
}
