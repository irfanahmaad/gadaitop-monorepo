import { UserEntity } from '../entities/user.entity';

export class UserDto extends UserEntity {
  rolesIds?: number[];

  constructor(user: UserEntity, options?: { rolesIds: number[] }) {
    super();

    if (options) {
      this.rolesIds = options.rolesIds;
    }

    Object.assign(this, user);
  }
}
