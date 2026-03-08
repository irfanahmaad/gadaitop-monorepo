import { MigrationInterface, QueryRunner } from 'typeorm';

export class StockOpnameMultiStoreAssignee1773000000000 implements MigrationInterface {
  name = 'StockOpnameMultiStoreAssignee1773000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create stock_opname_session_stores junction table
    await queryRunner.query(`
      CREATE TABLE "stock_opname_session_stores" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL,
        "created_by" uuid,
        "updated_by" uuid,
        "deleted_by" uuid,
        "so_session_id" uuid NOT NULL,
        "store_id" uuid NOT NULL,
        CONSTRAINT "UQ_sos_stores_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_stock_opname_session_stores" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_sos_stores_session" ON "stock_opname_session_stores" ("so_session_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sos_stores_store" ON "stock_opname_session_stores" ("store_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sos_stores_session_store" ON "stock_opname_session_stores" ("so_session_id", "store_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_stores" ADD CONSTRAINT "FK_sos_stores_session" FOREIGN KEY ("so_session_id") REFERENCES "stock_opname_sessions"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_stores" ADD CONSTRAINT "FK_sos_stores_store" FOREIGN KEY ("store_id") REFERENCES "branches"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // 2. Create stock_opname_session_assignees junction table
    await queryRunner.query(`
      CREATE TABLE "stock_opname_session_assignees" (
        "id" SERIAL NOT NULL,
        "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL,
        "created_by" uuid,
        "updated_by" uuid,
        "deleted_by" uuid,
        "so_session_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "UQ_sos_assignees_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_stock_opname_session_assignees" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_sos_assignees_session" ON "stock_opname_session_assignees" ("so_session_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sos_assignees_user" ON "stock_opname_session_assignees" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sos_assignees_session_user" ON "stock_opname_session_assignees" ("so_session_id", "user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_assignees" ADD CONSTRAINT "FK_sos_assignees_session" FOREIGN KEY ("so_session_id") REFERENCES "stock_opname_sessions"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_assignees" ADD CONSTRAINT "FK_sos_assignees_user" FOREIGN KEY ("user_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // 3. Backfill: copy store_id from sessions to session_stores
    await queryRunner.query(`
      INSERT INTO "stock_opname_session_stores" (
        "uuid", "created_at", "updated_at", "version",
        "so_session_id", "store_id"
      )
      SELECT
        uuid_generate_v4(),
        s."created_at",
        s."updated_at",
        1,
        s."uuid",
        s."store_id"
      FROM "stock_opname_sessions" s
      WHERE s."store_id" IS NOT NULL
    `);

    // 4. Backfill: copy assigned_to (or created_by) from sessions to session_assignees
    await queryRunner.query(`
      INSERT INTO "stock_opname_session_assignees" (
        "uuid", "created_at", "updated_at", "version",
        "so_session_id", "user_id"
      )
      SELECT
        uuid_generate_v4(),
        s."created_at",
        s."updated_at",
        1,
        s."uuid",
        COALESCE(s."assigned_to", s."created_by")
      FROM "stock_opname_sessions" s
      WHERE COALESCE(s."assigned_to", s."created_by") IS NOT NULL
    `);

    // 5. Drop old index that includes store_id
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_888d95c5a3e198497d053a4dea"`,
    );

    // 6. Drop FK and columns for store_id
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" DROP CONSTRAINT IF EXISTS "FK_e9d8353a3e42e4284ad521fb95e"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_e9d8353a3e42e4284ad521fb95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" DROP COLUMN "store_id"`,
    );

    // 7. Drop FK and columns for assigned_to
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" DROP CONSTRAINT IF EXISTS "FK_62a1f7a3fece6b7f45d2fd97d11"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_62a1f7a3fece6b7f45d2fd97d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" DROP COLUMN "assigned_to"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add store_id column
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" ADD "store_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e9d8353a3e42e4284ad521fb95" ON "stock_opname_sessions" ("store_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" ADD CONSTRAINT "FK_e9d8353a3e42e4284ad521fb95e" FOREIGN KEY ("store_id") REFERENCES "branches"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Re-add assigned_to column
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" ADD "assigned_to" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62a1f7a3fece6b7f45d2fd97d1" ON "stock_opname_sessions" ("assigned_to")`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" ADD CONSTRAINT "FK_62a1f7a3fece6b7f45d2fd97d11" FOREIGN KEY ("assigned_to") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Restore store_id from first session_store per session
    await queryRunner.query(`
      UPDATE "stock_opname_sessions" s
      SET "store_id" = (
        SELECT ss."store_id"
        FROM "stock_opname_session_stores" ss
        WHERE ss."so_session_id" = s."uuid"
        ORDER BY ss."created_at" ASC
        LIMIT 1
      )
    `);

    // Restore assigned_to from first session_assignee per session
    await queryRunner.query(`
      UPDATE "stock_opname_sessions" s
      SET "assigned_to" = (
        SELECT sa."user_id"
        FROM "stock_opname_session_assignees" sa
        WHERE sa."so_session_id" = s."uuid"
        ORDER BY sa."created_at" ASC
        LIMIT 1
      )
    `);

    // Recreate composite index
    await queryRunner.query(
      `CREATE INDEX "IDX_888d95c5a3e198497d053a4dea" ON "stock_opname_sessions" ("pt_id", "store_id", "status")`,
    );

    // Drop junction tables
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_assignees" DROP CONSTRAINT "FK_sos_assignees_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_assignees" DROP CONSTRAINT "FK_sos_assignees_session"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_assignees_session_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_assignees_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_assignees_session"`,
    );
    await queryRunner.query(`DROP TABLE "stock_opname_session_assignees"`);

    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_stores" DROP CONSTRAINT "FK_sos_stores_store"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_stores" DROP CONSTRAINT "FK_sos_stores_session"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_stores_session_store"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_stores_store"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_stores_session"`,
    );
    await queryRunner.query(`DROP TABLE "stock_opname_session_stores"`);
  }
}
