import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Grant READ SPK to auction_staff role so they can view SPK/NKB when opening
 * batch item detail (fixes 403 on GET /api/v1/spk/:id/nkb).
 */
export class AuctionStaffReadSpk1773600000000 implements MigrationInterface {
  name = 'AuctionStaffReadSpk1773600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE roles
      SET permissions = permissions || '[{"action":"read","subject":"Spk"}]'::jsonb
      WHERE code = 'auction_staff'
        AND NOT (permissions @> '[{"action":"read","subject":"Spk"}]')
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Removing one element from jsonb array is verbose and rarely needed.
    // Revert by re-running role seed on fresh DB if required.
  }
}
