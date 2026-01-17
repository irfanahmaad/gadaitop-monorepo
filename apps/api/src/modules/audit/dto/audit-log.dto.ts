import { AuditLogEntity } from '../entities/audit-log.entity';

export class AuditLogDto extends AuditLogEntity {
  constructor(auditLog: AuditLogEntity) {
    super();
    Object.assign(this, auditLog);
  }
}
