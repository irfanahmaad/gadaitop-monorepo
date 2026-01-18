import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMacAddressToIpAddress1768697483802 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_6f74f950bd3c6bdf8f1e76bd22"`);
    await queryRunner.query(`ALTER TABLE "device_registrations" DROP CONSTRAINT "UQ_50ea8038a4b793c32732d74923a"`);
    await queryRunner.query(`ALTER TABLE "device_registrations" RENAME COLUMN "mac_address" TO "ip_address"`);
    await queryRunner.query(`ALTER TABLE "device_registrations" DROP COLUMN "ip_address"`);
    await queryRunner.query(`ALTER TABLE "device_registrations" ADD "ip_address" inet NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_8a5fa784244a2df79a456ce839" ON "device_registrations" ("ip_address") `);
    await queryRunner.query(`ALTER TABLE "device_registrations" ADD CONSTRAINT "UQ_ca01b7fe4fde1885987e3b8ac93" UNIQUE ("user_id", "ip_address")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "device_registrations" DROP CONSTRAINT "UQ_ca01b7fe4fde1885987e3b8ac93"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8a5fa784244a2df79a456ce839"`);
    await queryRunner.query(`ALTER TABLE "device_registrations" DROP COLUMN "ip_address"`);
    await queryRunner.query(`ALTER TABLE "device_registrations" ADD "ip_address" character varying(17) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "device_registrations" RENAME COLUMN "ip_address" TO "mac_address"`);
    await queryRunner.query(`ALTER TABLE "device_registrations" ADD CONSTRAINT "UQ_50ea8038a4b793c32732d74923a" UNIQUE ("user_id", "mac_address")`);
    await queryRunner.query(`CREATE INDEX "IDX_6f74f950bd3c6bdf8f1e76bd22" ON "device_registrations" ("mac_address") `);
  }
}
