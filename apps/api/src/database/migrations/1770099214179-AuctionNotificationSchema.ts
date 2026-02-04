import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuctionNotificationSchema1770099214179 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "recipient_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "body" text NOT NULL, "type" character varying(50) NOT NULL DEFAULT 'info', "read_at" TIMESTAMP WITH TIME ZONE, "related_entity_type" character varying(100), "related_entity_id" character varying(36), CONSTRAINT "UQ_84989adc90ebf9f1c9b7ba66f0a" UNIQUE ("uuid"), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_5332a4daa46fd3f4e6625dd275" ON "notifications" ("recipient_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_aef1c7aef3725068e5540f8f00" ON "notifications" ("type") `);
    await queryRunner.query(`CREATE TYPE "public"."auction_batches_status_enum" AS ENUM('draft', 'pickup_in_progress', 'validation_pending', 'ready_for_auction', 'cancelled')`);
    await queryRunner.query(`CREATE TABLE "auction_batches" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "batch_code" character varying(50) NOT NULL, "store_id" uuid NOT NULL, "pt_id" uuid NOT NULL, "status" "public"."auction_batches_status_enum" NOT NULL DEFAULT 'draft', "assigned_to" uuid, "assigned_at" TIMESTAMP WITH TIME ZONE, "notes" text, CONSTRAINT "UQ_c2458d3cc28902950bb8b48b5a6" UNIQUE ("uuid"), CONSTRAINT "UQ_d811d877ef43fb05c0d1a6b5438" UNIQUE ("batch_code"), CONSTRAINT "PK_5c79f49859ff00f7b9d10c1d629" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_d811d877ef43fb05c0d1a6b543" ON "auction_batches" ("batch_code") `);
    await queryRunner.query(`CREATE INDEX "IDX_4e7c60e5bbab509e3f610b8488" ON "auction_batches" ("store_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_5346e4fe1ef26c5fc0f8e864a5" ON "auction_batches" ("pt_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_47e9f4b759186a6416817f29c5" ON "auction_batches" ("status") `);
    await queryRunner.query(`CREATE TYPE "public"."auction_batch_items_pickup_status_enum" AS ENUM('pending', 'taken', 'failed')`);
    await queryRunner.query(`CREATE TYPE "public"."auction_batch_items_validation_verdict_enum" AS ENUM('ok', 'return', 'reject')`);
    await queryRunner.query(`CREATE TABLE "auction_batch_items" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "version" integer NOT NULL, "created_by" uuid, "updated_by" uuid, "deleted_by" uuid, "auction_batch_id" uuid NOT NULL, "spk_item_id" uuid NOT NULL, "pickup_status" "public"."auction_batch_items_pickup_status_enum" NOT NULL DEFAULT 'pending', "failure_reason" text, "validation_verdict" "public"."auction_batch_items_validation_verdict_enum", "validation_notes" text, "validation_photos" jsonb, "validated_by" uuid, "validated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_a8f9313534f95971560e797a9ac" UNIQUE ("uuid"), CONSTRAINT "PK_17b379be9d515c4245e0f14efea" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_136f655665e9b97b31c5863017" ON "auction_batch_items" ("auction_batch_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_f5e88580cdd7f86713d8f68b42" ON "auction_batch_items" ("spk_item_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_5c9f310966d489debab9d5f1d0" ON "auction_batch_items" ("pickup_status") `);
    await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_5332a4daa46fd3f4e6625dd275d" FOREIGN KEY ("recipient_id") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "auction_batches" ADD CONSTRAINT "FK_4e7c60e5bbab509e3f610b84889" FOREIGN KEY ("store_id") REFERENCES "branches"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "auction_batches" ADD CONSTRAINT "FK_5346e4fe1ef26c5fc0f8e864a57" FOREIGN KEY ("pt_id") REFERENCES "companies"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "auction_batches" ADD CONSTRAINT "FK_f66aaae0de10b02d97e1347d004" FOREIGN KEY ("assigned_to") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "auction_batch_items" ADD CONSTRAINT "FK_136f655665e9b97b31c5863017f" FOREIGN KEY ("auction_batch_id") REFERENCES "auction_batches"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "auction_batch_items" ADD CONSTRAINT "FK_f5e88580cdd7f86713d8f68b429" FOREIGN KEY ("spk_item_id") REFERENCES "spk_items"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "auction_batch_items" ADD CONSTRAINT "FK_9e76e20de2091a7487247efc238" FOREIGN KEY ("validated_by") REFERENCES "users"("uuid") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auction_batch_items" DROP CONSTRAINT "FK_9e76e20de2091a7487247efc238"`);
    await queryRunner.query(`ALTER TABLE "auction_batch_items" DROP CONSTRAINT "FK_f5e88580cdd7f86713d8f68b429"`);
    await queryRunner.query(`ALTER TABLE "auction_batch_items" DROP CONSTRAINT "FK_136f655665e9b97b31c5863017f"`);
    await queryRunner.query(`ALTER TABLE "auction_batches" DROP CONSTRAINT "FK_f66aaae0de10b02d97e1347d004"`);
    await queryRunner.query(`ALTER TABLE "auction_batches" DROP CONSTRAINT "FK_5346e4fe1ef26c5fc0f8e864a57"`);
    await queryRunner.query(`ALTER TABLE "auction_batches" DROP CONSTRAINT "FK_4e7c60e5bbab509e3f610b84889"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_5332a4daa46fd3f4e6625dd275d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5c9f310966d489debab9d5f1d0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f5e88580cdd7f86713d8f68b42"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_136f655665e9b97b31c5863017"`);
    await queryRunner.query(`DROP TABLE "auction_batch_items"`);
    await queryRunner.query(`DROP TYPE "public"."auction_batch_items_validation_verdict_enum"`);
    await queryRunner.query(`DROP TYPE "public"."auction_batch_items_pickup_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_47e9f4b759186a6416817f29c5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5346e4fe1ef26c5fc0f8e864a5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4e7c60e5bbab509e3f610b8488"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d811d877ef43fb05c0d1a6b543"`);
    await queryRunner.query(`DROP TABLE "auction_batches"`);
    await queryRunner.query(`DROP TYPE "public"."auction_batches_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_aef1c7aef3725068e5540f8f00"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5332a4daa46fd3f4e6625dd275"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
