import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { ActiveStatusEnum } from '../../../constants/active-status';

/**
 * RS Section 8.1.b - Master PT:
 * - PT sebagai induk data dari toko/cabang
 * - PT berelasi dengan pemilik (one to one). 1 Pemilik hanya memiliki 1 PT
 * - PT berelasi dengan toko (one to many). 1 PT dapat memiliki banyak toko
 * - Data: kode unik, nama, nomor telepon, pemilik
 * 
 * RS Section 9: "Konfigurasi bunga/denda via UI admin tanpa hardcode"
 */
@Entity({ name: 'companies' })
export class CompanyEntity extends AbstractEntity {
  // ============================================
  // BASIC INFO - RS: "Data: kode unik, nama, nomor telepon, pemilik"
  // ============================================

  @Column({ type: 'varchar', length: 10, unique: true })
  @Index()
  companyCode: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  companyName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  // ============================================
  // OWNER RELATIONSHIP (1:1)
  // RS: "1 Pemilik hanya memiliki 1 PT"
  // ============================================

  @Column({ name: 'owner_id', type: 'uuid', unique: true })
  @Index()
  ownerId: string;

  @OneToOne('UserEntity', 'ownedCompany')
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'uuid' })
  owner: Relation<any>;

  // ============================================
  // BRANCHES (1:N)
  // RS: "1 PT dapat memiliki banyak toko"
  // ============================================

  @OneToMany('BranchEntity', 'company')
  branches: Relation<any[]>;

  // ============================================
  // INTEREST & FEE CONFIGURATION
  // RS Section 9: "Konfigurasi bunga/denda via UI admin tanpa hardcode"
  // ============================================

  /**
   * x = bunga cepat (default: 5%) - Pelunasan < 15 hari
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  earlyInterestRate: number;

  /**
   * y = bunga normal (default: 10%) - Pelunasan ≤ 1 bulan
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  normalInterestRate: number;

  /**
   * adm = biaya administrasi (default: 0%)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  adminFeeRate: number;

  /**
   * as = biaya asuransi (default: 0 rupiah)
   */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  insuranceFee: number;

  /**
   * d = denda keterlambatan (default: 2%)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.0 })
  latePenaltyRate: number;

  /**
   * Minimal angsuran pokok (default: Rp 50.000)
   */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 50000.0 })
  minPrincipalPayment: number;

  /**
   * Tenor default (dalam hari) - default 30 hari (1 bulan)
   */
  @Column({ type: 'smallint', default: 30 })
  defaultTenorDays: number;

  /**
   * Batas hari untuk bunga cepat (default: 15 hari)
   */
  @Column({ type: 'smallint', default: 15 })
  earlyPaymentDays: number;

  // ============================================
  // STATUS
  // ============================================

  @Column({
    type: 'enum',
    enum: ActiveStatusEnum,
    default: ActiveStatusEnum.Active,
  })
  activeStatus: ActiveStatusEnum;

  // ============================================
  // USERS ASSIGNED TO THIS COMPANY
  // ============================================

  @OneToMany('UserEntity', 'company')
  users: Relation<any[]>;
}
