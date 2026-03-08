import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockOpnameAssignedTo1772910000000 implements MigrationInterface {
  name = 'AddStockOpnameAssignedTo1772910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" ADD "assigned_to" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62a1f7a3fece6b7f45d2fd97d1" ON "stock_opname_sessions" ("assigned_to") `,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" ADD CONSTRAINT "FK_62a1f7a3fece6b7f45d2fd97d11" FOREIGN KEY ("assigned_to") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" DROP CONSTRAINT "FK_62a1f7a3fece6b7f45d2fd97d11"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62a1f7a3fece6b7f45d2fd97d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" DROP COLUMN "assigned_to"`,
    );
  }
}
