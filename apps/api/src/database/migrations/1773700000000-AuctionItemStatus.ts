import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add auction_item_status to auction_batch_items (FR-132: Admin PT update item status).
 * Values: ready, in_auction, sold, unsold. Nullable for existing rows.
 */
export class AuctionItemStatus1773700000000 implements MigrationInterface {
  name = 'AuctionItemStatus1773700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."auction_batch_items_auction_item_status_enum" AS ENUM(
          'ready', 'in_auction', 'sold', 'unsold'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);
    await queryRunner.query(`
      ALTER TABLE "auction_batch_items"
      ADD COLUMN IF NOT EXISTS "auction_item_status" "public"."auction_batch_items_auction_item_status_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "auction_batch_items"
      DROP COLUMN IF EXISTS "auction_item_status"
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."auction_batch_items_auction_item_status_enum"
    `);
  }
}
