import { Exclude } from 'class-transformer';
import {
    BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, Relation,
} from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { generateHash } from '../../../common/utils';
import { ActiveStatusEnum } from '../../../constants/active-status';
import { RoleEntity } from '../../role/entities/role.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  accessToken: string | null;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  googleId: string;

  @Column({ type: 'varchar', nullable: true })
  jobPosition: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isRegistrationComplete: boolean;

  @Column({ type: 'boolean', default: false })
  isAdministrator: boolean;

  @Column({
    type: 'enum',
    enum: ActiveStatusEnum,
    default: ActiveStatusEnum.Inactive,
  })
  activeStatus: ActiveStatusEnum;

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable()
  roles: Relation<RoleEntity[]>;

  @Column({ type: 'varchar', nullable: true })
  validateEmailToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  validateEmailExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword?(): Promise<void> {
    if (
      this.password &&
      this.password.length > 0 &&
      !this.password.match(/^\$2[ayb]\$.{56}$/)
    ) {
      this.password = await generateHash(this.password);
    }
  }
}
