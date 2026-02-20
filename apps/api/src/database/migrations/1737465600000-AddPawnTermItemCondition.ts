import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPawnTermItemCondition1737465600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pawn_terms" ADD "item_condition" character varying(64) NOT NULL DEFAULT 'present_and_matching'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pawn_terms" DROP COLUMN "item_condition"`);
  }
}
