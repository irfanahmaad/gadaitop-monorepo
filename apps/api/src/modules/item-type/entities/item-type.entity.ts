import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';

/**
 * RS Section 8.1.f - Master Tipe Barang:
 * - Terdapat master tipe barang untuk membedakan barang yang digadai
 * - Data: nama tipe barang, kode tipe barang
 * 
 * Used for:
 * - SPK internal format: [Tipe barang][kode urutan] e.g., H00000001
 */
@Entity({ name: 'item_types' })
export class ItemTypeEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 5, unique: true })
  @Index()
  typeCode: string; // e.g., 'H' for Handphone, 'L' for Laptop

  @Column({ type: 'varchar', length: 100 })
  typeName: string; // e.g., 'Handphone', 'Laptop', 'Emas'

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Sort order for display
   */
  @Column({ type: 'smallint', default: 0 })
  sortOrder: number;

  /**
   * Icon or image URL (optional)
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;
}
