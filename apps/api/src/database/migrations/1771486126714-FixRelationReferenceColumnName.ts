import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixRelationReferenceColumnName1771486126714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_5ff67a53e3777f7ab6186db44ba"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_8d40e01b5d2c0b68995b772b753"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_246426dfd001466a1d5e47322f4"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_6f9395c9037632a31107c8a9e58"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_6dcdcbb7d72f64602307ec4ab39"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP CONSTRAINT "FK_effe7e9ada364e852a9786119a4"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP CONSTRAINT "FK_4f4d3ec42069f54a2a1d574d98a"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP CONSTRAINT "FK_9b60bbf713076d0ac07aa036060"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_a35729a94e7280cbebaaa541a20"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "companyId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "companyId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "branchId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "REL_8d40e01b5d2c0b68995b772b75"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "ownedCompanyId"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "REL_6dcdcbb7d72f64602307ec4ab3"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "ownerId"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP COLUMN "branchId"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP COLUMN "targetCompanyId"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP COLUMN "processedBy"`);
    await queryRunner.query(`ALTER TABLE "branches" DROP COLUMN "companyId"`);
    await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_4bc1204a05dde26383e3955b0a1" FOREIGN KEY ("company_id") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("company_id") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_5a58f726a41264c8b3e86d4a1de" FOREIGN KEY ("branch_id") REFERENCES "branches"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_5ab6e6437720dc237f99cdc6612" FOREIGN KEY ("owned_company_id") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "FK_df63e1563bbd91b428b5c50d8ad" FOREIGN KEY ("owner_id") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD CONSTRAINT "FK_55334515060f63e9558e4ad7d33" FOREIGN KEY ("branch_id") REFERENCES "branches"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD CONSTRAINT "FK_277c74ec8c535eaa07ec13c77ab" FOREIGN KEY ("target_company_id") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD CONSTRAINT "FK_ef9c0dbc382a32d48a0da187657" FOREIGN KEY ("processed_by") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_5973f79e64a27c506b07cd84b29" FOREIGN KEY ("company_id") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_5973f79e64a27c506b07cd84b29"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP CONSTRAINT "FK_ef9c0dbc382a32d48a0da187657"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP CONSTRAINT "FK_277c74ec8c535eaa07ec13c77ab"`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" DROP CONSTRAINT "FK_55334515060f63e9558e4ad7d33"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_df63e1563bbd91b428b5c50d8ad"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5ab6e6437720dc237f99cdc6612"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5a58f726a41264c8b3e86d4a1de"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_4bc1204a05dde26383e3955b0a1"`);
    await queryRunner.query(`ALTER TABLE "branches" ADD "companyId" uuid`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD "processedBy" uuid`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD "targetCompanyId" uuid`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD "branchId" uuid`);
    await queryRunner.query(`ALTER TABLE "companies" ADD "ownerId" uuid`);
    await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "REL_6dcdcbb7d72f64602307ec4ab3" UNIQUE ("ownerId")`);
    await queryRunner.query(`ALTER TABLE "users" ADD "ownedCompanyId" uuid`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "REL_8d40e01b5d2c0b68995b772b75" UNIQUE ("ownedCompanyId")`);
    await queryRunner.query(`ALTER TABLE "users" ADD "branchId" uuid`);
    await queryRunner.query(`ALTER TABLE "users" ADD "companyId" uuid`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "companyId" uuid`);
    await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_a35729a94e7280cbebaaa541a20" FOREIGN KEY ("companyId") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD CONSTRAINT "FK_9b60bbf713076d0ac07aa036060" FOREIGN KEY ("branchId") REFERENCES "branches"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD CONSTRAINT "FK_4f4d3ec42069f54a2a1d574d98a" FOREIGN KEY ("targetCompanyId") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "borrow_requests" ADD CONSTRAINT "FK_effe7e9ada364e852a9786119a4" FOREIGN KEY ("processedBy") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "companies" ADD CONSTRAINT "FK_6dcdcbb7d72f64602307ec4ab39" FOREIGN KEY ("ownerId") REFERENCES "users"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_6f9395c9037632a31107c8a9e58" FOREIGN KEY ("companyId") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_246426dfd001466a1d5e47322f4" FOREIGN KEY ("branchId") REFERENCES "branches"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_8d40e01b5d2c0b68995b772b753" FOREIGN KEY ("ownedCompanyId") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_5ff67a53e3777f7ab6186db44ba" FOREIGN KEY ("companyId") REFERENCES "companies"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
