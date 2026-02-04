import { NotificationEntity } from '../entities/notification.entity';

export class NotificationDto {
  uuid: string;
  recipientId: string;
  title: string;
  body: string;
  type: string;
  readAt: Date | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: Date;

  constructor(notification: NotificationEntity) {
    this.uuid = notification.uuid;
    this.recipientId = notification.recipientId;
    this.title = notification.title;
    this.body = notification.body;
    this.type = notification.type ?? 'info';
    this.readAt = notification.readAt ?? null;
    this.relatedEntityType = notification.relatedEntityType ?? null;
    this.relatedEntityId = notification.relatedEntityId ?? null;
    this.createdAt = notification.createdAt;
  }
}
