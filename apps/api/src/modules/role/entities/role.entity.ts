import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';

import type { IAbility } from '../../../interfaces/IAbility';

/**
 * System Roles as defined in RS Section 8.1.e:
 * 1. owner (Pemilik/Super Admin)
 * 2. company_admin (Admin PT)
 * 3. branch_staff (Staff Toko)
 * 4. stock_auditor (Stock Opname)
 * 5. auction_staff (Lelang)
 * 6. marketing (Marketing/Validator)
 */
@Entity({ name: 'roles' })
export class RoleEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: [] })
  permissions: IAbility[];

  // System roles cannot be deleted or modified by users
  @Column({ type: 'boolean', default: false })
  isSystemRole: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Optional: Company-specific custom roles
  @Column({ type: 'uuid', nullable: true })
  @Index()
  companyId: string | null;

  @ManyToOne('CompanyEntity', { nullable: true })
  @JoinColumn({ name: 'companyId', referencedColumnName: 'uuid' })
  company: Relation<any> | null;

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: Relation<UserEntity[]>;

  // Helper methods
  hasPermission(action: string, subject: string): boolean {
    return this.permissions.some(
      (p) => p.action === action && p.subject === subject,
    );
  }
}
