import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { Auth } from '../../decorators';
import { NotificationService } from './notification.service';
import { NotificationDto } from './dto/notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';

@Controller({ path: 'notifications', version: '1' })
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Auth([])
  async findAll(
    @Query() queryDto: QueryNotificationDto,
    @Req() req: Request,
  ): Promise<{ data: NotificationDto[]; meta: PageMetaDto }> {
    const user = (req as any).user;
    const recipientId = user?.uuid;
    if (!recipientId) {
      throw new UnauthorizedException('User UUID is required for notifications');
    }
    return this.notificationService.findAll(queryDto, recipientId);
  }

  @Get('unread-count')
  @Auth([])
  async getUnreadCount(@Req() req: Request): Promise<{ count: number }> {
    const user = (req as any).user;
    const recipientId = user?.uuid;
    if (!recipientId) {
      throw new UnauthorizedException('User UUID is required for notifications');
    }
    return this.notificationService.getUnreadCount(recipientId);
  }

  @Get(':id')
  @Auth([])
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<NotificationDto> {
    const user = (req as any).user;
    const recipientId = user?.uuid;
    if (!recipientId) {
      throw new UnauthorizedException('User UUID is required for notifications');
    }
    return this.notificationService.findOne(id, recipientId);
  }

  @Patch(':id/read')
  @Auth([])
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<NotificationDto> {
    const user = (req as any).user;
    const recipientId = user?.uuid;
    if (!recipientId) {
      throw new UnauthorizedException('User UUID is required for notifications');
    }
    return this.notificationService.markAsRead(id, recipientId);
  }

  @Post('read-all')
  @Auth([])
  async markAllAsRead(@Req() req: Request): Promise<{ count: number }> {
    const user = (req as any).user;
    const recipientId = user?.uuid;
    if (!recipientId) {
      throw new UnauthorizedException('User UUID is required for notifications');
    }
    return this.notificationService.markAllAsRead(recipientId);
  }
}
