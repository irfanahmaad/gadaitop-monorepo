import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
    BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne,
    OneToMany, OneToOne, Relation,
} from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { ActiveStatusEnum } from '../../../constants/active-status';
import { RoleEntity } from '../../role/entities/role.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  // ============================================
  // BASIC INFO
  // ============================================

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Index(['email'])
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Index(['phoneNumber'])
  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  // ============================================
  // ROLES: Many-to-Many with RoleEntity
  // ============================================

  @ManyToMany(() => RoleEntity, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Relation<RoleEntity[]>;

  // ============================================
  // MULTI-TENANCY: Company & Branch Assignment
  // ============================================

  /**
   * For non-owner users: which company they belong to
   * Admin PT, Staff assigned to a company
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  companyId: string | null;

  @ManyToOne('CompanyEntity', { nullable: true })
  @JoinColumn({ name: 'companyId', referencedColumnName: 'uuid' })
  company: Relation<any> | null;

  /**
   * For branch-level users: which branch they're assigned to
   * Staff Toko, Stock Opname staff
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  branchId: string | null;

  @ManyToOne('BranchEntity', { nullable: true })
  @JoinColumn({ name: 'branchId', referencedColumnName: 'uuid' })
  branch: Relation<any> | null;

  /**
   * For owner role: link to owned company (1:1 relationship)
   * RS: "PT berelasi dengan pemilik (one to one). 1 Pemilik hanya memiliki 1 PT"
   */
  @Column({ type: 'uuid', nullable: true, unique: true })
  ownedCompanyId: string | null;

  @OneToOne('CompanyEntity', 'owner', { nullable: true })
  @JoinColumn({ name: 'ownedCompanyId', referencedColumnName: 'uuid' })
  ownedCompany: Relation<any> | null;

  // ============================================
  // STATUS & SECURITY
  // ============================================

  @Column({
    type: 'enum',
    enum: ActiveStatusEnum,
    default: ActiveStatusEnum.Active,
  })
  @Index()
  activeStatus: ActiveStatusEnum;

  // RS Section 9: "Terdapat penguncian IP address"
  // Registered devices stored in separate table
  @OneToMany('DeviceRegistrationEntity', 'user')
  registeredDevices: Relation<any[]>;

  @Column({ type: 'inet', nullable: true })
  lastLoginIp: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'smallint', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lockedUntil: Date | null;

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  validateEmailToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  validateEmailExpires: Date | null;

  // ============================================
  // PASSWORD RESET
  // ============================================

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resetPasswordExpires: Date | null;

  // ============================================
  // TOKENS (JWT)
  // ============================================

  @Exclude()
  @Column({ type: 'text', nullable: true })
  accessToken: string | null;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  // ============================================
  // LEGACY FIELDS (keep for backward compatibility)
  // ============================================

  @Column({ type: 'varchar', nullable: true })
  googleId: string | null;

  @Column({ type: 'varchar', nullable: true })
  jobPosition: string | null;

  @Column({ type: 'boolean', default: false })
  isRegistrationComplete: boolean;

  @Column({ type: 'boolean', default: false })
  isAdministrator: boolean;

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (
      this.password &&
      this.password.length > 0 &&
      !this.password.match(/^\$2[ayb]\$.{56}$/)
    ) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  isLocked(): boolean {
    return this.lockedUntil !== null && this.lockedUntil > new Date();
  }

  hasRole(roleCode: string): boolean {
    return this.roles?.some((role) => role.code === roleCode) ?? false;
  }

  isOwner(): boolean {
    return this.hasRole('owner');
  }

  isCompanyAdmin(): boolean {
    return this.hasRole('company_admin');
  }

  getRoleCodes(): string[] {
    return (
      this.roles
        ?.map((role) => role.code)
        .filter((code): code is string => code !== null) ?? []
    );
  }
}
