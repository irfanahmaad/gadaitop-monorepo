import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import {
  DynamicQueryBuilder,
  QueryBuilderOptionsType,
  sortAttribute,
} from '../../common/helpers/query-builder';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationDto } from './dto/notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepository: Repository<NotificationEntity>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationDto> {
    const notification = this.notificationRepository.create({
      recipientId: dto.recipientId,
      title: dto.title,
      body: dto.body,
      type: dto.type ?? 'info',
      relatedEntityType: dto.relatedEntityType ?? null,
      relatedEntityId: dto.relatedEntityId ?? null,
    });
    const saved = await this.notificationRepository.save(notification);
    return new NotificationDto(saved);
  }

  async findAll(
    queryDto: QueryNotificationDto,
    recipientId: string,
  ): Promise<{ data: NotificationDto[]; meta: PageMetaDto }> {
    const qb = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.recipientId = :recipientId', { recipientId });

    if (queryDto.read === 'read') {
      qb.andWhere('n.readAt IS NOT NULL');
    } else if (queryDto.read === 'unread') {
      qb.andWhere('n.readAt IS NULL');
    }

    const qbOptions: QueryBuilderOptionsType<NotificationEntity> = {
      ...queryDto,
      orderBy: sortAttribute(queryDto.sortBy, {
        createdAt: { createdAt: true },
      }) ?? { createdAt: 'DESC' } as any,
    };

    const dynamicQueryBuilder = new DynamicQueryBuilder(this.notificationRepository.metadata);
    const [notifications, count] = await dynamicQueryBuilder.buildDynamicQuery(
      qb,
      qbOptions,
    );
    const data = notifications.map((n) => new NotificationDto(n));
    const meta = new PageMetaDto({
      pageOptionsDto: queryDto,
      itemCount: count,
    });
    return { data, meta };
  }

  async findOne(uuid: string, recipientId: string): Promise<NotificationDto> {
    const notification = await this.notificationRepository.findOne({
      where: { uuid, recipientId },
    });
    if (!notification) {
      throw new NotFoundException(
        `Notification with UUID ${uuid} not found for this user`,
      );
    }
    return new NotificationDto(notification);
  }

  async markAsRead(uuid: string, recipientId: string): Promise<NotificationDto> {
    const notification = await this.notificationRepository.findOne({
      where: { uuid, recipientId },
    });
    if (!notification) {
      throw new NotFoundException(
        `Notification with UUID ${uuid} not found for this user`,
      );
    }
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);
    return new NotificationDto(notification);
  }

  async markAllAsRead(recipientId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ readAt: new Date() })
      .where('recipientId = :recipientId', { recipientId })
      .andWhere('readAt IS NULL')
      .execute();
    return { count: result.affected ?? 0 };
  }

  async getUnreadCount(recipientId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({
      where: { recipientId, readAt: IsNull() },
    });
    return { count };
  }
}
