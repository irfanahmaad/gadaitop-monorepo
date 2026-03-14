import { Seeder } from '@concepta/typeorm-seeding';

import { AuctionBatchAssigneeEntity } from '../../modules/auction/entities/auction-batch-assignee.entity';
import { AuctionBatchEntity } from '../../modules/auction/entities/auction-batch.entity';
import { AuctionBatchItemEntity } from '../../modules/auction/entities/auction-batch-item.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { SpkRecordEntity } from '../../modules/spk/entities/spk-record.entity';
import { AuctionAssigneeRoleEnum } from '../../constants/auction-assignee-role';
import { SpkStatusEnum } from '../../constants/spk-status';
import { AuctionBatchStatusEnum } from '../../constants/auction-batch-status';
import { AuctionPickupStatusEnum } from '../../constants/auction-pickup-status';
import { AuctionValidationVerdictEnum } from '../../constants/auction-validation-verdict';
import { dataSource } from '../db.seed';
import { AuctionBatchFactory } from './auction-batch.factory';
import { AuctionBatchItemFactory } from './auction-batch-item.factory';

/**
 * Auction Batch Seed
 *
 * Creates 6 scenario batches per store:
 * 1. Fresh Draft (no assignees)
 * 2. Draft with Assignees (marketing + auction staff)
 * 3. Pickup In Progress (mix of taken/pending)
 * 4. Validation Pending (all taken, some with verdict)
 * 5. Ready for Auction (all validated, finalized)
 * 6. Cancelled
 */
export class AuctionBatchSeed extends Seeder {
  async run(): Promise<void> {
    const batchFactory = this.factory(AuctionBatchFactory);
    const itemFactory = this.factory(AuctionBatchItemFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const batchRepo = dataSource.getRepository(AuctionBatchEntity);
    const assigneeRepo = dataSource.getRepository(AuctionBatchAssigneeEntity);
    const spkRepo = dataSource.getRepository(SpkRecordEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const existingCount = await batchRepo.count();
    if (existingCount > 0) {
      console.log(
        `Auction batches already exist (${existingCount}), skipping seed`,
      );
      return;
    }

    const overdueSpks = await spkRepo.find({
      where: { status: SpkStatusEnum.Overdue },
      relations: ['items'],
    });

    if (overdueSpks.length === 0) {
      console.log('⚠️ No Overdue SPKs found. Run OverdueSpkSeed first.');
      return;
    }

    // Group items by store (storeId -> { ptId, storeId, items[] })
    const itemsByStore = new Map<
      string,
      { ptId: string; storeId: string; items: { uuid: string }[] }
    >();
    for (const spk of overdueSpks) {
      const storeId = spk.storeId;
      const key = `${spk.ptId}:${storeId}`;
      const existing = itemsByStore.get(key);
      const list = existing?.items ?? [];
      for (const item of spk.items ?? []) {
        list.push({ uuid: item.uuid });
      }
      if (!existing) {
        itemsByStore.set(key, { ptId: spk.ptId, storeId, items: list });
      } else {
        existing.items = list;
      }
    }

    let totalBatches = 0;
    const scenarioLabels = [
      'Fresh Draft',
      'Draft with Assignees',
      'Pickup In Progress',
      'Validation Pending',
      'Ready for Auction',
      'Cancelled',
    ];

    for (const [, { ptId, storeId, items }] of itemsByStore) {
      if (items.length < 6) continue;

      // Find users for this PT (auction_staff and marketing)
      const ptUsers = await userRepo.find({
        where: { companyId: ptId },
        relations: ['roles'],
      });
      const auctionStaff = ptUsers.find((u) =>
        u.roles?.some((r) => r.code === 'auction_staff'),
      );
      const marketingUser = ptUsers.find((u) =>
        u.roles?.some((r) => r.code === 'marketing'),
      );

      const ts = Date.now().toString().slice(-6);
      const chunkSize = Math.max(1, Math.floor(items.length / 6));
      const chunks = [
        items.slice(0, chunkSize),
        items.slice(chunkSize, chunkSize * 2),
        items.slice(chunkSize * 2, chunkSize * 3),
        items.slice(chunkSize * 3, chunkSize * 4),
        items.slice(chunkSize * 4, chunkSize * 5),
        items.slice(chunkSize * 5, chunkSize * 6),
      ];

      for (let s = 0; s < 6; s++) {
        const chunk = chunks[s];
        if (!chunk?.length) continue;

        const statuses: AuctionBatchStatusEnum[] = [
          AuctionBatchStatusEnum.Draft,
          AuctionBatchStatusEnum.Draft,
          AuctionBatchStatusEnum.PickupInProgress,
          AuctionBatchStatusEnum.ValidationPending,
          AuctionBatchStatusEnum.ReadyForAuction,
          AuctionBatchStatusEnum.Cancelled,
        ];
        const status = statuses[s];
        const batch = await batchFactory.create({
          batchCode: `AB-${ts}-${s + 1}`,
          name: `Scenario ${s + 1}: ${scenarioLabels[s]}`,
          storeId,
          ptId,
          status,
          notes: `Seeded scenario: ${scenarioLabels[s]}`,
        });
        totalBatches++;

        // Assignees: scenario 1 none, 2+ have marketing + auction staff
        if (s >= 1 && (marketingUser || auctionStaff)) {
          if (marketingUser) {
            await assigneeRepo.save(
              assigneeRepo.create({
                batch: batch,
                user: marketingUser,
                role: AuctionAssigneeRoleEnum.MarketingStaff,
              }),
            );
          }
          if (auctionStaff) {
            await assigneeRepo.save(
              assigneeRepo.create({
                batch: batch,
                user: auctionStaff,
                role: AuctionAssigneeRoleEnum.AuctionStaff,
              }),
            );
          }
        }

        // Items: pickup and validation state per scenario
        for (let i = 0; i < chunk.length; i++) {
          const item = chunk[i];
          let pickupStatus = AuctionPickupStatusEnum.Pending;
          let validationVerdict: AuctionValidationVerdictEnum | null = null;

          if (s >= 2) {
            pickupStatus =
              i < chunk.length / 2
                ? AuctionPickupStatusEnum.Taken
                : AuctionPickupStatusEnum.Pending;
          }
          if (s >= 3) {
            pickupStatus = AuctionPickupStatusEnum.Taken;
            validationVerdict =
              i === 0
                ? AuctionValidationVerdictEnum.Ok
                : i === 1
                  ? AuctionValidationVerdictEnum.Return
                  : null;
          }
          if (s >= 4) {
            pickupStatus = AuctionPickupStatusEnum.Taken;
            validationVerdict =
              i % 3 === 0
                ? AuctionValidationVerdictEnum.Ok
                : i % 3 === 1
                  ? AuctionValidationVerdictEnum.Return
                  : AuctionValidationVerdictEnum.Reject;
          }
          if (s === 5) {
            pickupStatus =
              i % 2 === 0
                ? AuctionPickupStatusEnum.Taken
                : AuctionPickupStatusEnum.Pending;
            validationVerdict =
              i === 0 ? AuctionValidationVerdictEnum.Ok : null;
          }

          await itemFactory.create({
            auctionBatchId: batch.uuid,
            spkItemId: item.uuid,
            pickupStatus,
            validationVerdict,
          });
        }
      }
    }

    console.log(`✅ Seeded ${totalBatches} Auction Batches (6 scenarios per store)`);
  }
}
