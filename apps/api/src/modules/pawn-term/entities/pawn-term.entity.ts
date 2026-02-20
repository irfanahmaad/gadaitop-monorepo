import { Column, Entity, Index, JoinColumn, ManyToOne, Relation, Unique } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';

/**
 * Pawn lending terms and conditions (Syarat Mata).
 * RS 8.2.e - Configurable per PT and item type.
 */
@Entity({ name: 'pawn_terms' })
@Unique(['ptId', 'itemTypeId'])
export class PawnTermEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  ptId: string;

  @ManyToOne('CompanyEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pt_id', referencedColumnName: 'uuid' })
  pt: Relation<any>;

  @Column({ type: 'uuid' })
  @Index()
  itemTypeId: string;

  @ManyToOne('ItemTypeEntity', { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'item_type_id', referencedColumnName: 'uuid' })
  itemType: Relation<any>;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  loanLimitMin: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  loanLimitMax: string;

  @Column({ type: 'int', nullable: true })
  tenorMin: number;

  @Column({ type: 'int', nullable: true })
  tenorMax: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  adminFee: string;

  /** Item condition rule: present_and_matching | present_but_mismatch */
  @Column({ type: 'varchar', length: 64, default: 'present_and_matching' })
  itemCondition: string;
}
