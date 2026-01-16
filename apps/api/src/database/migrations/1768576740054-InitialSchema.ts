import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1768576740054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "permissions" jsonb, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "public"."users_active_status_enum" AS ENUM('1', '2')`);
    await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying, "access_token" character varying, "refresh_token" character varying, "google_id" character varying, "job_position" character varying, "is_email_verified" boolean NOT NULL DEFAULT false, "is_phone_verified" boolean NOT NULL DEFAULT false, "is_registration_complete" boolean NOT NULL DEFAULT false, "is_administrator" boolean NOT NULL DEFAULT false, "active_status" "public"."users_active_status_enum" NOT NULL DEFAULT '2', "validate_email_token" character varying, "validate_email_expires" TIMESTAMP, "reset_password_token" character varying, "reset_password_expires" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "users_roles_roles" ("users_id" integer NOT NULL, "roles_id" integer NOT NULL, CONSTRAINT "PK_27d0ca9155872fb087086b6a9f5" PRIMARY KEY ("users_id", "roles_id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_178c6a2b971c18df6467eaf687" ON "users_roles_roles" ("users_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_291889ab59fe7785020c96066e" ON "users_roles_roles" ("roles_id") `);
    await queryRunner.query(`ALTER TABLE "users_roles_roles" ADD CONSTRAINT "FK_178c6a2b971c18df6467eaf687a" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "users_roles_roles" ADD CONSTRAINT "FK_291889ab59fe7785020c96066e9" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users_roles_roles" DROP CONSTRAINT "FK_291889ab59fe7785020c96066e9"`);
    await queryRunner.query(`ALTER TABLE "users_roles_roles" DROP CONSTRAINT "FK_178c6a2b971c18df6467eaf687a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_291889ab59fe7785020c96066e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_178c6a2b971c18df6467eaf687"`);
    await queryRunner.query(`DROP TABLE "users_roles_roles"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_active_status_enum"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
