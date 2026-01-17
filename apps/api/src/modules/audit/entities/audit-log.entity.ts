import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

import { AuditActionEnum } from '../../../constants/audit-action';

/**
 * RS Section 4 - Business Objectives:
 * - "Audit trail & keamanan data: Setiap perubahan data tercatat (user, waktu, nilai lama/baru)"
 * 
 * Note: This entity does NOT extend AbstractEntity because audit logs should never be soft-deleted
 */
@Entity({ name: 'audit_logs' })
@Index(['entityName', 'entityId'])
@Index(['userId', 'createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', generated: 'uuid' })
  @Index()
  uuid: string;

  /**
   * Entity/table name that was modified
   */
  @Column({ type: 'varchar', length: 100 })
  @Index()
  entityName: string;

  /**
   * Primary key (uuid) of the modified record
   */
  @Column({ type: 'uuid' })
  entityId: string;

  /**
   * Action performed
   */
  @Column({ type: 'enum', enum: AuditActionEnum })
  @Index()
  action: AuditActionEnum;

  /**
   * User who performed the action
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string | null;

  @ManyToOne('UserEntity', { nullable: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'uuid' })
  user: Relation<any> | null;

  /**
   * Old values before change (JSONB)
   * RS: "nilai lama"
   */
  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, unknown> | null;

  /**
   * New values after change (JSONB)
   * RS: "nilai baru"
   */
  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, unknown> | null;

  /**
   * Changed fields list
   */
  @Column({ type: 'jsonb', nullable: true })
  changedFields: string[] | null;

  /**
   * IP address of the request
   */
  @Column({ type: 'inet', nullable: true })
  ipAddress: string | null;

  /**
   * User agent string
   */
  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  /**
   * Additional context/metadata
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Index()
  createdAt: Date;
}
