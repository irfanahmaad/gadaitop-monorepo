import { RoleEntity } from '../../role/entities/role.entity';

export class LogedUserDto {
  userId: number;

  uuid: string;

  roles: RoleEntity[];

  constructor(userId: number, uuid: string, roles: RoleEntity[]) {
    this.userId = userId;
    this.uuid = uuid;
    this.roles = roles;
  }
}
