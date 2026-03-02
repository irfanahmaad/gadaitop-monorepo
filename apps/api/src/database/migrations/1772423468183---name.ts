import { MigrationInterface, QueryRunner } from 'typeorm';

export class Name1772423468183 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auction_batches" ADD "name" character varying(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auction_batches" DROP COLUMN "name"`);
  }
}
