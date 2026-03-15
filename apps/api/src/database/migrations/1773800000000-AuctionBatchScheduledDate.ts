import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add scheduled_date to auction_batches (FR-243, FR-254).
 */
export class AuctionBatchScheduledDate1773800000000 implements MigrationInterface {
  name = 'AuctionBatchScheduledDate1773800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "auction_batches"
      ADD COLUMN IF NOT EXISTS "scheduled_date" TIMESTAMP WITH TIME ZONE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "auction_batches"
      DROP COLUMN IF EXISTS "scheduled_date"
    `);
  }
}
