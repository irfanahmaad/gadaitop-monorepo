import { UserEntity } from '../entities/user.entity';

export class UserDto extends UserEntity {
  rolesIds?: number[];

  constructor(user: UserEntity, options?: { rolesIds: number[] }) {
    super();

    // Copy properties from user entity to DTO
    // Since UserDto extends UserEntity, @Exclude() decorators are inherited
    Object.assign(this, user);

    if (options) {
      this.rolesIds = options.rolesIds;
    }
  }
}
