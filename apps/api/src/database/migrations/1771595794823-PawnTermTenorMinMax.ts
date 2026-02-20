import { MigrationInterface, QueryRunner } from 'typeorm';

export class PawnTermTenorMinMax1771595794823 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pawn_terms" DROP COLUMN "tenor_default"`);
    await queryRunner.query(`ALTER TABLE "pawn_terms" ADD "tenor_min" integer`);
    await queryRunner.query(`ALTER TABLE "pawn_terms" ADD "tenor_max" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pawn_terms" DROP COLUMN "tenor_max"`);
    await queryRunner.query(`ALTER TABLE "pawn_terms" DROP COLUMN "tenor_min"`);
    await queryRunner.query(`ALTER TABLE "pawn_terms" ADD "tenor_default" integer NOT NULL`);
  }
}
