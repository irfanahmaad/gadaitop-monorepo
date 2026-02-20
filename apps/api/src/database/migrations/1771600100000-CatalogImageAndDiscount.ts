import { MigrationInterface, QueryRunner } from 'typeorm';

export class CatalogImageAndDiscount1771600100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "catalogs" ADD "image_url" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalogs" ADD "discount_name" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalogs" ADD "discount_amount" numeric(15,2) DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "catalogs" DROP COLUMN "image_url"`);
    await queryRunner.query(
      `ALTER TABLE "catalogs" DROP COLUMN "discount_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalogs" DROP COLUMN "discount_amount"`,
    );
  }
}
