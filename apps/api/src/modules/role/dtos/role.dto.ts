import { RoleEntity } from '../entities/role.entity';

export class RoleDto extends RoleEntity {
  constructor(role: Partial<RoleEntity>) {
    super();
    Object.assign(this, role);
  }
}
