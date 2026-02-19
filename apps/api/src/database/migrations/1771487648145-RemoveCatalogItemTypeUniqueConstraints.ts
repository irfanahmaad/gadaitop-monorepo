import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCatalogItemTypeUniqueConstraints1771487648145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "catalogs" DROP CONSTRAINT "UQ_dd5ceb9fa629fcb0793520d31b6"`);
    await queryRunner.query(`ALTER TABLE "item_types" DROP CONSTRAINT "UQ_5a50dd82637fb016155f33d11ae"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e115eb1a2924cc3138a098d510" ON "item_types" ("type_code") WHERE "deleted_at" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_ebafddaccc9c55028f7b5e605b" ON "catalogs" ("code") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_637330a08f130978e4cd38ff7a" ON "catalogs" ("pt_id", "code") WHERE "deleted_at" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_637330a08f130978e4cd38ff7a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ebafddaccc9c55028f7b5e605b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e115eb1a2924cc3138a098d510"`);
    await queryRunner.query(`ALTER TABLE "item_types" ADD CONSTRAINT "UQ_5a50dd82637fb016155f33d11ae" UNIQUE ("type_code")`);
    await queryRunner.query(`ALTER TABLE "catalogs" ADD CONSTRAINT "UQ_dd5ceb9fa629fcb0793520d31b6" UNIQUE ("code", "pt_id")`);
  }
}
