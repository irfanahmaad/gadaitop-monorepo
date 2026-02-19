import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { BorrowRequestStatusEnum } from '../../../constants/borrow-request-status';

/**
 * RS Section 8.1.d - Pinjam PT:
 * - Track borrow requests between owners
 * - Toko akan aktif setelah pemilik yang PT nya dipinjam mengkonfirmasi
 */
@Entity({ name: 'borrow_requests' })
@Index(['requesterId', 'status'])
@Index(['targetCompanyId', 'status'])
export class BorrowRequestEntity extends AbstractEntity {
  /**
   * The branch being requested to borrow
   */
  @Column({ name: 'branch_id', type: 'uuid' })
  @Index()
  branchId: string;

  @ManyToOne('BranchEntity')
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'uuid' })
  branch: Relation<any>;

  /**
   * The owner requesting to borrow
   */
  @Column({ name: 'requester_id', type: 'uuid' })
  @Index()
  requesterId: string;

  @ManyToOne('UserEntity')
  @JoinColumn({ name: 'requesterId', referencedColumnName: 'uuid' })
  requester: Relation<any>;

  /**
   * The company being borrowed from
   */
  @Column({ name: 'target_company_id', type: 'uuid' })
  @Index()
  targetCompanyId: string;

  @ManyToOne('CompanyEntity')
  @JoinColumn({ name: 'target_company_id', referencedColumnName: 'uuid' })
  targetCompany: Relation<any>;

  /**
   * Request status
   */
  @Column({
    type: 'enum',
    enum: BorrowRequestStatusEnum,
    default: BorrowRequestStatusEnum.Pending,
  })
  @Index()
  status: BorrowRequestStatusEnum;

  /**
   * Reason for the request
   */
  @Column({ type: 'text', nullable: true })
  requestReason: string | null;

  /**
   * Who processed this request
   */
  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy: string | null;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'processed_by', referencedColumnName: 'uuid' })
  processor: Relation<any> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processedAt: Date | null;

  /**
   * Reason for rejection (if rejected)
   */
  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;
}
