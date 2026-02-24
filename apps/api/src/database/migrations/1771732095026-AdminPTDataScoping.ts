import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminPTDataScoping1771732095026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_3f70f82f70813666ace8d91feb"`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD "pt_id" uuid`);
    await queryRunner.query(`ALTER TABLE "nkb_records" ADD "pt_id" uuid`);
    await queryRunner.query(`ALTER TABLE "nkb_records" ADD "store_id" uuid`);
    await queryRunner.query(`ALTER TABLE "customers" ADD "branch_id" uuid`);
    await queryRunner.query(`ALTER TABLE "cash_mutations" ADD "pt_id" uuid`);
    await queryRunner.query(`ALTER TABLE "catalogs" ALTER COLUMN "discount_amount" SET NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_2aef807878d6700bfefc2c2add" ON "notifications" ("pt_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_a0783bbfa7719864a14a12d0f7" ON "nkb_records" ("pt_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_f449baed241fa8c7ba406a6f51" ON "nkb_records" ("store_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_e63cf3526e6e92b414b9604f7a" ON "nkb_records" ("pt_id", "created_at") `);
    await queryRunner.query(`CREATE INDEX "IDX_95a9aa6c2d5e5f2a479290656b" ON "nkb_records" ("pt_id", "store_id", "status") `);
    await queryRunner.query(`CREATE INDEX "IDX_2ae4f4add790956c0f16a48cb7" ON "customers" ("branch_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_ba0494031c5bca1f000ebb966a" ON "cash_mutations" ("pt_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_f442c475386c2947ec676f5fc4" ON "cash_mutations" ("pt_id", "store_id", "mutation_date", "id") `);
    await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_2aef807878d6700bfefc2c2adde" FOREIGN KEY ("pt_id") REFERENCES "companies"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "nkb_records" ADD CONSTRAINT "FK_a0783bbfa7719864a14a12d0f7e" FOREIGN KEY ("pt_id") REFERENCES "companies"("uuid") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "nkb_records" ADD CONSTRAINT "FK_f449baed241fa8c7ba406a6f510" FOREIGN KEY ("store_id") REFERENCES "branches"("uuid") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_2ae4f4add790956c0f16a48cb74" FOREIGN KEY ("branch_id") REFERENCES "branches"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "cash_mutations" ADD CONSTRAINT "FK_ba0494031c5bca1f000ebb966ad" FOREIGN KEY ("pt_id") REFERENCES "companies"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cash_mutations" DROP CONSTRAINT "FK_ba0494031c5bca1f000ebb966ad"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_2ae4f4add790956c0f16a48cb74"`);
    await queryRunner.query(`ALTER TABLE "nkb_records" DROP CONSTRAINT "FK_f449baed241fa8c7ba406a6f510"`);
    await queryRunner.query(`ALTER TABLE "nkb_records" DROP CONSTRAINT "FK_a0783bbfa7719864a14a12d0f7e"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_2aef807878d6700bfefc2c2adde"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f442c475386c2947ec676f5fc4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ba0494031c5bca1f000ebb966a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2ae4f4add790956c0f16a48cb7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_95a9aa6c2d5e5f2a479290656b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e63cf3526e6e92b414b9604f7a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f449baed241fa8c7ba406a6f51"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a0783bbfa7719864a14a12d0f7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2aef807878d6700bfefc2c2add"`);
    await queryRunner.query(`ALTER TABLE "catalogs" ALTER COLUMN "discount_amount" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "cash_mutations" DROP COLUMN "pt_id"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "branch_id"`);
    await queryRunner.query(`ALTER TABLE "nkb_records" DROP COLUMN "store_id"`);
    await queryRunner.query(`ALTER TABLE "nkb_records" DROP COLUMN "pt_id"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "pt_id"`);
    await queryRunner.query(`CREATE INDEX "IDX_3f70f82f70813666ace8d91feb" ON "cash_mutations" ("id", "store_id", "mutation_date") `);
  }
}
