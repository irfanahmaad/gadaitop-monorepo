import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add 'view' to audit_logs action enum for FR-258 (audit batch/item view).
 */
export class AuditActionView1773900000000 implements MigrationInterface {
  name = 'AuditActionView1773900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'view'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values easily; leave enum as-is
  }
}
