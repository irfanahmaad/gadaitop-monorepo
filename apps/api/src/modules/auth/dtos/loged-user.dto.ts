import { RoleEntity } from '../../role/entities/role.entity';

export class LogedUserDto {
  userId: number;

  roles: RoleEntity[];

  constructor(userId: number, roles: RoleEntity[]) {
    this.userId = userId;
    this.roles = roles;
  }
}
