import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPawnTermRuleName1771600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pawn_terms" ADD "rule_name" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pawn_terms" DROP COLUMN "rule_name"`);
  }
}
