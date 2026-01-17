import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
  getConnection,
} from 'typeorm';

import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditActionEnum } from '../../constants/audit-action';
import { UserEntity } from '../user/entities/user.entity';

/**
 * Audit Subscriber to automatically log entity changes
 * RS Section 4: "Audit trail & keamanan data: Setiap perubahan data tercatat (user, waktu, nilai lama/baru)"
 * 
 * Note: This subscriber listens to UserEntity as a base.
 * For comprehensive audit logging of all entities, consider using interceptors or services.
 */
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo(): typeof UserEntity {
    return UserEntity;
  }

  /**
   * Check if entity should be audited (has uuid field indicating AbstractEntity)
   */
  private shouldAudit(metadata: any): boolean {
    // Skip audit_logs table to avoid recursion
    if (metadata.tableName === 'audit_logs') {
      return false;
    }

    // Check if entity has uuid column (indicates it extends AbstractEntity)
    return metadata.columns.some((col: any) => col.propertyName === 'uuid');
  }

  /**
   * Log entity creation
   */
  async afterInsert(event: InsertEvent<any>): Promise<void> {
    if (!this.shouldAudit(event.metadata)) {
      return;
    }

    // Ensure entity has uuid
    if (!event.entity || !event.entity.uuid) {
      return;
    }

    try {
      const connection = getConnection();
      const auditRepository = connection.getRepository(AuditLogEntity);

      const auditLog = auditRepository.create({
        entityName: event.metadata.tableName,
        entityId: event.entity.uuid,
        action: AuditActionEnum.Create,
        userId: event.entity.createdBy || null,
        oldValues: null,
        newValues: this.sanitizeEntity(event.entity),
        changedFields: Object.keys(event.entity).filter(
          (key) => !['id', 'uuid', 'createdAt', 'updatedAt', 'version'].includes(key),
        ),
        ipAddress: null, // Will be set by controller/interceptor
        userAgent: null, // Will be set by controller/interceptor
      });

      await auditRepository.save(auditLog);
    } catch (error) {
      // Silently fail audit logging to not break the main operation
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Log entity updates
   */
  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    if (!this.shouldAudit(event.metadata)) {
      return;
    }

    if (!event.entity || !event.entity.uuid) {
      return;
    }

    if (!event.databaseEntity) {
      return;
    }

    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};
    const changedFields: string[] = [];

    // Compare old and new values
    for (const column of event.metadata.columns) {
      const oldValue = event.databaseEntity[column.propertyName];
      const newValue = event.entity[column.propertyName];

      if (oldValue !== newValue && column.propertyName !== 'version') {
        oldValues[column.propertyName] = oldValue;
        newValues[column.propertyName] = newValue;
        changedFields.push(column.propertyName);
      }
    }

    // Only log if there are actual changes
    if (changedFields.length === 0) {
      return;
    }

    try {
      const connection = getConnection();
      const auditRepository = connection.getRepository(AuditLogEntity);

      const auditLog = auditRepository.create({
        entityName: event.metadata.tableName,
        entityId: event.entity.uuid,
        action: AuditActionEnum.Update,
        userId: event.entity.updatedBy || null,
        oldValues: this.sanitizeEntity(oldValues),
        newValues: this.sanitizeEntity(newValues),
        changedFields,
        ipAddress: null, // Will be set by controller/interceptor
        userAgent: null, // Will be set by controller/interceptor
      });

      await auditRepository.save(auditLog);
    } catch (error) {
      // Silently fail audit logging to not break the main operation
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Log entity soft deletes
   */
  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    if (!this.shouldAudit(event.metadata)) {
      return;
    }

    if (!event.entity || !event.entity.uuid) {
      return;
    }

    try {
      const connection = getConnection();
      const auditRepository = connection.getRepository(AuditLogEntity);

      const auditLog = auditRepository.create({
        entityName: event.metadata.tableName,
        entityId: event.entity.uuid,
        action: AuditActionEnum.Delete,
        userId: event.entity.deletedBy || null,
        oldValues: this.sanitizeEntity(event.entity),
        newValues: null,
        changedFields: null,
        ipAddress: null,
        userAgent: null,
      });

      await auditRepository.save(auditLog);
    } catch (error) {
      // Silently fail audit logging to not break the main operation
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Sanitize entity to remove sensitive data and circular references
   */
  private sanitizeEntity(entity: any): Record<string, unknown> {
    if (!entity) {
      return {};
    }

    const sanitized: Record<string, unknown> = {};
    const excludeFields = ['password', 'accessToken', 'refreshToken', 'resetPasswordToken', 'validateEmailToken'];

    for (const key in entity) {
      if (
        Object.prototype.hasOwnProperty.call(entity, key) &&
        !excludeFields.includes(key) &&
        typeof entity[key] !== 'function' &&
        !(entity[key] instanceof Date && isNaN(entity[key].getTime()))
      ) {
        // Handle relations - just store the ID
        if (entity[key] && typeof entity[key] === 'object' && 'uuid' in entity[key]) {
          sanitized[key] = { uuid: entity[key].uuid };
        } else if (Array.isArray(entity[key])) {
          sanitized[key] = entity[key].map((item: any) =>
            item && typeof item === 'object' && 'uuid' in item
              ? { uuid: item.uuid }
              : item,
          );
        } else {
          sanitized[key] = entity[key];
        }
      }
    }

    return sanitized;
  }
}
