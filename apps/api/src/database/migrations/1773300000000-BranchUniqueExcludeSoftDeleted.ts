import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Allow reusing branch_code after soft-delete:
 * - Drop global unique on branch_code and composite unique on (company_id, branch_code)
 * - Add partial unique indexes that apply only when deleted_at IS NULL
 */
export class BranchUniqueExcludeSoftDeleted1773300000000
  implements MigrationInterface
{
  name = 'BranchUniqueExcludeSoftDeleted1773300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "branches" DROP CONSTRAINT IF EXISTS "UQ_7b48a680eb17f642cc36ff78d8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" DROP CONSTRAINT IF EXISTS "UQ_d6d58bb4c363b381f3d47e461f0"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_branches_branch_code_not_deleted" ON "branches" ("branch_code") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_branches_company_branch_code_not_deleted" ON "branches" ("company_id", "branch_code") WHERE "deleted_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_branches_company_branch_code_not_deleted"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_branches_branch_code_not_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" ADD CONSTRAINT "UQ_7b48a680eb17f642cc36ff78d8f" UNIQUE ("branch_code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "branches" ADD CONSTRAINT "UQ_d6d58bb4c363b381f3d47e461f0" UNIQUE ("company_id", "branch_code")`,
    );
  }
}
