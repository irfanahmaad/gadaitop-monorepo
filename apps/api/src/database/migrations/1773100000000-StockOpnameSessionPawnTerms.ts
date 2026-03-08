import { MigrationInterface, QueryRunner } from 'typeorm';

export class StockOpnameSessionPawnTerms1773100000000 implements MigrationInterface {
  name = 'StockOpnameSessionPawnTerms1773100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add mata_item_count column to stock_opname_sessions
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" ADD "mata_item_count" integer`,
    );

    // 2. Create stock_opname_session_pawn_terms junction table
    await queryRunner.query(`
      CREATE TABLE "stock_opname_session_pawn_terms" (
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
        "pawn_term_id" uuid NOT NULL,
        CONSTRAINT "UQ_sos_pawn_terms_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_stock_opname_session_pawn_terms" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_sos_pawn_terms_session" ON "stock_opname_session_pawn_terms" ("so_session_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sos_pawn_terms_pawn_term" ON "stock_opname_session_pawn_terms" ("pawn_term_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sos_pawn_terms_session_pawn_term" ON "stock_opname_session_pawn_terms" ("so_session_id", "pawn_term_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_pawn_terms" ADD CONSTRAINT "FK_sos_pawn_terms_session" FOREIGN KEY ("so_session_id") REFERENCES "stock_opname_sessions"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_pawn_terms" ADD CONSTRAINT "FK_sos_pawn_terms_pawn_term" FOREIGN KEY ("pawn_term_id") REFERENCES "pawn_terms"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock_opname_sessions" DROP COLUMN "mata_item_count"`,
    );

    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_pawn_terms" DROP CONSTRAINT "FK_sos_pawn_terms_pawn_term"`,
    );
    await queryRunner.query(
      `ALTER TABLE "stock_opname_session_pawn_terms" DROP CONSTRAINT "FK_sos_pawn_terms_session"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_pawn_terms_session_pawn_term"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_pawn_terms_pawn_term"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_sos_pawn_terms_session"`,
    );
    await queryRunner.query(`DROP TABLE "stock_opname_session_pawn_terms"`);
  }
}
