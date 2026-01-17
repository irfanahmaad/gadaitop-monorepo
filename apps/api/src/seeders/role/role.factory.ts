import { Factory } from '@concepta/typeorm-seeding';

import { RoleEntity } from '../../modules/role/entities/role.entity';

export class RoleFactory extends Factory<RoleEntity> {
  protected async entity(): Promise<RoleEntity> {
    const role = new RoleEntity();

    return Promise.resolve(role);
  }
}
