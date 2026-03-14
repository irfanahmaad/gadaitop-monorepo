import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomerBirthPlaceSubDistrictVillagePhone21773200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "birth_place" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "sub_district" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "village" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "phone2" character varying(20)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "phone2"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "village"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "sub_district"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "birth_place"`);
  }
}
