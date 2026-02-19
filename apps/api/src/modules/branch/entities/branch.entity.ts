import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Relation, Unique } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { BranchStatusEnum } from '../../../constants/branch-status';

/**
 * RS Section 8.1.c - Master Toko:
 * - Toko adalah unit yang menjadi tempat transaksi antara customer dengan PT
 * - Toko harus dimiliki oleh sebuah PT
 * - Data toko hanya dapat dilihat oleh pemilik PT yang memiliki relasi
 * - Data: kode lokasi, nama toko (short), nama toko (long), alamat, telepon, kota, kode PT, pemilik
 * 
 * RS Section 8.1.d - Pinjam PT:
 * - Pemilik dapat memiliki toko di bawah naungan PT pemilik lain
 * - Toko aktif setelah pemilik yang PT-nya dipinjam mengkonfirmasi
 */
@Entity({ name: 'branches' })
@Unique(['companyId', 'branchCode'])
@Index(['companyId', 'status'])
@Index(['companyId', 'city'])
export class BranchEntity extends AbstractEntity {
  // ============================================
  // BASIC INFO - RS: "Data: kode lokasi, nama toko (short/long), alamat, telepon, kota"
  // ============================================

  @Column({ type: 'varchar', length: 20, unique: true })
  @Index()
  branchCode: string; // kode lokasi

  @Column({ type: 'varchar', length: 50 })
  shortName: string; // nama toko (short version)

  @Column({ type: 'varchar', length: 255 })
  @Index()
  fullName: string; // nama toko (long version)

  @Column({ type: 'text' })
  address: string; // alamat

  @Column({ type: 'varchar', length: 20 })
  phone: string; // telepon

  @Column({ type: 'varchar', length: 100 })
  @Index()
  city: string; // kota

  // ============================================
  // COMPANY RELATIONSHIP - RS: "kode PT"
  // "Toko harus dimiliki oleh sebuah PT"
  // ============================================

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @ManyToOne('CompanyEntity', 'branches')
  @JoinColumn({ name: 'companyId', referencedColumnName: 'uuid' })
  company: Relation<any>;

  // ============================================
  // PINJAM PT FEATURE - RS Section 8.1.d
  // "pemilik dapat memiliki toko di bawah naungan PT pemilik lain"
  // ============================================

  /**
   * If isBorrowed = true, this branch belongs to actualOwner
   * but operates under a different company's PT
   */
  @Column({ type: 'boolean', default: false })
  isBorrowed: boolean;

  /**
   * The actual owner of this branch (for "Pinjam PT" case)
   * NULL if branch is not borrowed
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  actualOwnerId: string | null;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'actualOwnerId', referencedColumnName: 'uuid' })
  actualOwner: Relation<any> | null;

  /**
   * Approval status for borrowed branches
   */
  @Column({
    type: 'enum',
    enum: BranchStatusEnum,
    default: BranchStatusEnum.Draft,
  })
  @Index()
  status: BranchStatusEnum;

  /**
   * Who approved the borrow request (the PT owner being borrowed from)
   */
  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'approvedBy', referencedColumnName: 'uuid' })
  approver: Relation<any> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt: Date | null;

  /**
   * Rejection reason if borrow request was rejected
   */
  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  // ============================================
  // TRANSACTION SEQUENCE
  // RS: "kode urutan transaksi yang dimiliki tiap toko" (8 digits)
  // ============================================

  @Column({ type: 'int', default: 0 })
  transactionSequence: number;

  // ============================================
  // USERS ASSIGNED TO THIS BRANCH
  // ============================================

  @OneToMany('UserEntity', 'branch')
  users: Relation<any[]>;

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get next transaction sequence number (8 digits padded)
   */
  getNextSequence(): string {
    return String(this.transactionSequence + 1).padStart(8, '0');
  }

  /**
   * Check if this branch is accessible by a user
   */
  isAccessibleBy(user: any): boolean {
    // Owner of the company
    if (user.ownedCompanyId === this.companyId) {
      return true;
    }

    // Actual owner (for borrowed branches)
    if (this.isBorrowed && this.actualOwnerId === user.uuid) {
      return true;
    }

    // Company admin
    if (user.companyId === this.companyId && user.isCompanyAdmin?.()) {
      return true;
    }

    // Staff assigned to this branch
    if (user.branchId === this.uuid) {
      return true;
    }

    return false;
  }
}
