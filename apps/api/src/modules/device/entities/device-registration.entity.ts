import { Column, Entity, Index, JoinColumn, ManyToOne, Relation, Unique } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';

/**
 * RS Section 9 - Non-Functional Requirements:
 * - "Terdapat penguncian IP address untuk menentukan pc atau laptop 
 *    mana saja yang dapat mengakses aplikasi atau VPN"
 */
@Entity({ name: 'device_registrations' })
@Unique(['userId', 'ipAddress'])
@Index(['userId', 'isActive'])
export class DeviceRegistrationEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne('UserEntity', 'registeredDevices')
  @JoinColumn({ name: 'userId', referencedColumnName: 'uuid' })
  user: Relation<any>;

  /**
   * IP Address (IPv4 or IPv6) used to identify the device
   * This is easier to obtain in web and mobile apps compared to MAC address
   */
  @Column({ type: 'inet' })
  @Index()
  ipAddress: string;

  /**
   * Device identifier/name for user reference
   */
  @Column({ type: 'varchar', length: 100 })
  deviceName: string;

  /**
   * Device type: desktop, laptop, mobile
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  deviceType: string | null;

  /**
   * Operating system info
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  osInfo: string | null;

  /**
   * Is this device currently active/allowed
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Who registered/approved this device
   */
  @Column({ type: 'uuid', nullable: true })
  registeredBy: string | null;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  registeredAt: Date;

  /**
   * Last time this device was used for login
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastUsedAt: Date | null;

  /**
   * Last IP address used with this device
   */
  @Column({ type: 'inet', nullable: true })
  lastIpAddress: string | null;
}
