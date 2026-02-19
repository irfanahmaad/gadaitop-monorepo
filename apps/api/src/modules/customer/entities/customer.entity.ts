import { Exclude } from 'class-transformer';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { GenderEnum } from '../../../constants/gender';

/**
 * Customer master data (pawn service users).
 * Customers are separate from users - they authenticate via Customer Portal (NIK+PIN or Email+Password).
 * RS 8.3.b - PIN per customer (1:1). RS 8.3.a - Blacklist support.
 */
@Entity({ name: 'customers' })
@Index(['ptId', 'createdAt'])
export class CustomerEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 20, unique: true })
  @Index()
  nik: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  pinHash: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column({ type: 'enum', enum: GenderEnum })
  gender: GenderEnum;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  city: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ktpPhotoUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  selfiePhotoUrl: string | null;

  @Column({ type: 'uuid' })
  @Index()
  ptId: string;

  @ManyToOne('CompanyEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pt_id', referencedColumnName: 'uuid' })
  pt: Relation<any>;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'uuid' })
  creator: Relation<any> | null;

  // Blacklist (RS 8.3.a)
  @Column({ type: 'boolean', default: false })
  @Index()
  isBlacklisted: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  blacklistedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  blacklistedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'blacklisted_by', referencedColumnName: 'uuid' })
  blacklister: Relation<any> | null;

  @Column({ type: 'text', nullable: true })
  blacklistReason: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  unblacklistedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  unblacklistedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unblacklisted_by', referencedColumnName: 'uuid' })
  unblacklister: Relation<any> | null;

  @OneToMany('CustomerPinHistoryEntity', 'customer')
  pinHistory: Relation<any[]>;
}
