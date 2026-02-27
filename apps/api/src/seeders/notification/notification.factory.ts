import { Factory } from '@concepta/typeorm-seeding';

import { NotificationEntity } from '../../modules/notification/entities/notification.entity';

export class NotificationFactory extends Factory<NotificationEntity> {
  protected async entity(): Promise<NotificationEntity> {
    const entity = new NotificationEntity();
    return Promise.resolve(entity);
  }
}
