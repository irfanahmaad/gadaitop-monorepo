import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add marketing_notes and marketing_assets for Marketing Staff (FR-257).
 * Batch-level and item-level.
 */
export class AuctionMarketingNotesAssets1773500000000
  implements MigrationInterface
{
  name = 'AuctionMarketingNotesAssets1773500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "auction_batches"
      ADD COLUMN IF NOT EXISTS "marketing_notes" text,
      ADD COLUMN IF NOT EXISTS "marketing_assets" jsonb
    `);
    await queryRunner.query(`
      ALTER TABLE "auction_batch_items"
      ADD COLUMN IF NOT EXISTS "marketing_notes" text,
      ADD COLUMN IF NOT EXISTS "marketing_assets" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "auction_batches"
      DROP COLUMN IF EXISTS "marketing_notes",
      DROP COLUMN IF EXISTS "marketing_assets"
    `);
    await queryRunner.query(`
      ALTER TABLE "auction_batch_items"
      DROP COLUMN IF EXISTS "marketing_notes",
      DROP COLUMN IF EXISTS "marketing_assets"
    `);
  }
}
