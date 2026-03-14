import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuctionBatchAssignees1773200000000 implements MigrationInterface {
  name = 'AuctionBatchAssignees1773200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create enum for assignee role
    await queryRunner.query(`
      CREATE TYPE "public"."auction_batch_assignees_role_enum" AS ENUM('marketing_staff', 'auction_staff')
    `);

    // 2. Create auction_batch_assignees table
    await queryRunner.query(`
      CREATE TABLE "auction_batch_assignees" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        "created_by" uuid,
        "updated_by" uuid,
        "deleted_by" uuid,
        "auction_batch_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "public"."auction_batch_assignees_role_enum" NOT NULL,
        CONSTRAINT "UQ_auction_batch_assignees_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_auction_batch_assignees" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_auction_batch_assignees_batch" ON "auction_batch_assignees" ("auction_batch_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_auction_batch_assignees_user" ON "auction_batch_assignees" ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_batch_assignees" ADD CONSTRAINT "FK_auction_batch_assignees_batch" FOREIGN KEY ("auction_batch_id") REFERENCES "auction_batches"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_batch_assignees" ADD CONSTRAINT "FK_auction_batch_assignees_user" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // 3. Migrate existing assigned_to to auction_batch_assignees (as auction_staff)
    await queryRunner.query(`
      INSERT INTO "auction_batch_assignees" (
        "uuid", "created_at", "updated_at", "version",
        "auction_batch_id", "user_id", "role"
      )
      SELECT
        uuid_generate_v4(),
        COALESCE(b."assigned_at", b."created_at"),
        COALESCE(b."assigned_at", b."updated_at"),
        1,
        b."uuid",
        b."assigned_to",
        'auction_staff'::"public"."auction_batch_assignees_role_enum"
      FROM "auction_batches" b
      WHERE b."assigned_to" IS NOT NULL
    `);

    // 4. Drop FK and index for assigned_to, then drop columns
    await queryRunner.query(
      `ALTER TABLE "auction_batches" DROP CONSTRAINT IF EXISTS "FK_f66aaae0de10b02d97e1347d004"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_f66aaae0de10b02d97e1347d00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_batches" DROP COLUMN "assigned_to"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_batches" DROP COLUMN "assigned_at"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add assigned_to and assigned_at columns
    await queryRunner.query(
      `ALTER TABLE "auction_batches" ADD "assigned_to" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_batches" ADD "assigned_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f66aaae0de10b02d97e1347d00" ON "auction_batches" ("assigned_to")`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_batches" ADD CONSTRAINT "FK_f66aaae0de10b02d97e1347d004" FOREIGN KEY ("assigned_to") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Restore assigned_to/assigned_at from first auction_staff assignee per batch
    await queryRunner.query(`
      UPDATE "auction_batches" b
      SET
        "assigned_to" = (
          SELECT aba."user_id"
          FROM "auction_batch_assignees" aba
          WHERE aba."auction_batch_id" = b."uuid"
            AND aba."role" = 'auction_staff'
          ORDER BY aba."created_at" ASC
          LIMIT 1
        ),
        "assigned_at" = (
          SELECT aba."created_at"
          FROM "auction_batch_assignees" aba
          WHERE aba."auction_batch_id" = b."uuid"
            AND aba."role" = 'auction_staff'
          ORDER BY aba."created_at" ASC
          LIMIT 1
        )
      WHERE EXISTS (
        SELECT 1 FROM "auction_batch_assignees" aba
        WHERE aba."auction_batch_id" = b."uuid" AND aba."role" = 'auction_staff'
      )
    `);

    // Drop auction_batch_assignees table and enum
    await queryRunner.query(
      `ALTER TABLE "auction_batch_assignees" DROP CONSTRAINT "FK_auction_batch_assignees_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auction_batch_assignees" DROP CONSTRAINT "FK_auction_batch_assignees_batch"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_auction_batch_assignees_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_auction_batch_assignees_batch"`,
    );
    await queryRunner.query(`DROP TABLE "auction_batch_assignees"`);
    await queryRunner.query(
      `DROP TYPE "public"."auction_batch_assignees_role_enum"`,
    );
  }
}
