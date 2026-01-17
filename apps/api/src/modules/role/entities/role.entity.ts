import { Column, Entity, ManyToMany, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';

import type { IAbility } from '../../../interfaces/IAbility';
@Entity({ name: 'roles' })
export class RoleEntity extends AbstractEntity {
  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  code!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  permissions!: IAbility[];

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users!: Relation<UserEntity[]>;
}
