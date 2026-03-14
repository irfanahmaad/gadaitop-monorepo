import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add 'revoked' to borrow_requests status enum for main-PT revoke flow (US-4.8).
 */
export class BorrowRequestStatusRevoked1773400000000
  implements MigrationInterface
{
  name = 'BorrowRequestStatusRevoked1773400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."borrow_requests_status_enum" ADD VALUE 'revoked'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing an enum value; revert would require
    // recreating the type and column. No-op.
  }
}
