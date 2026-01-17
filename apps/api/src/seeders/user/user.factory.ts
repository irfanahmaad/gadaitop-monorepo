import { Factory } from '@concepta/typeorm-seeding';

import { generateHash } from '../../common/utils';
import { UserEntity } from '../../modules/user/entities/user.entity';

export class UserFactory extends Factory<UserEntity> {
  protected async entity(): Promise<UserEntity> {
    const user = new UserEntity();

    return Promise.resolve(user);
  }

  protected async preProcess(user: UserEntity): Promise<UserEntity> {
    if (user.password) {
      user.password = await generateHash(user.password);
    }

    return user;
  }
}
