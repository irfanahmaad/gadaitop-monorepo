import { Seeder } from '@concepta/typeorm-seeding';

import { AuctionBatchEntity } from '../../modules/auction/entities/auction-batch.entity';
import { AuctionBatchItemEntity } from '../../modules/auction/entities/auction-batch-item.entity';
import { SpkRecordEntity } from '../../modules/spk/entities/spk-record.entity';
import { SpkStatusEnum } from '../../constants/spk-status';
import { AuctionBatchStatusEnum } from '../../constants/auction-batch-status';
import { AuctionPickupStatusEnum } from '../../constants/auction-pickup-status';
import { dataSource } from '../db.seed';
import { AuctionBatchFactory } from './auction-batch.factory';
import { AuctionBatchItemFactory } from './auction-batch-item.factory';

/**
 * Auction Batch Seed
 * 
 * Creates auction batches for Overdue SPK items.
 * - Draft Batch (Recent overdue)
 * - ValidationPending Batch (Older overdue)
 */
export class AuctionBatchSeed extends Seeder {
  async run(): Promise<void> {
    const batchFactory = this.factory(AuctionBatchFactory);
    const itemFactory = this.factory(AuctionBatchItemFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const batchRepo = dataSource.getRepository(AuctionBatchEntity);
    const spkRepo = dataSource.getRepository(SpkRecordEntity);

    const existingCount = await batchRepo.count();
    if (existingCount > 0) {
      console.log(`Auction batches already exist (${existingCount}), skipping seed`);
      return;
    }

    // Find Overdue SPKs with items
    const overdueSpks = await spkRepo.find({
      where: { status: SpkStatusEnum.Overdue },
      relations: ['items']
    });

    if (overdueSpks.length === 0) {
      console.log('⚠️ No Overdue SPKs found. Run SpkSeed first.');
      return;
    }

    // Group items by store
    const itemsByStore = new Map<string, any[]>();
    for (const spk of overdueSpks) {
      const storeId = spk.storeId;
      const list = itemsByStore.get(storeId) || [];
      // Flatten items with spk info
      for (const item of spk.items) {
        list.push({ ...item, ptId: spk.ptId, storeId: spk.storeId });
      }
      itemsByStore.set(storeId, list);
    }

    let totalBatches = 0;

    for (const [storeId, items] of itemsByStore) {
      if (items.length === 0) continue;

      const ptId = items[0].ptId;
      const itemsCount = items.length;

      // Split items into two batches if possible, otherwise just one
      const batch1Items = items.slice(0, Math.ceil(itemsCount / 2));
      const batch2Items = items.slice(Math.ceil(itemsCount / 2));

      // 1. Draft Batch
      if (batch1Items.length > 0) {
        const batch = await batchFactory.create({
          batchCode: `AUC-B-${Date.now().toString().slice(-4)}-DR`,
          storeId,
          ptId,
          status: AuctionBatchStatusEnum.Draft,
          notes: 'Batch items overdue < 30 days',
        });
        totalBatches++;

        for (const item of batch1Items) {
          await itemFactory.create({
            auctionBatchId: batch.uuid,
            spkItemId: item.uuid,
            pickupStatus: AuctionPickupStatusEnum.Pending,
          });
        }
      }

      // 2. Validation Pending Batch
      if (batch2Items.length > 0) {
        const batch = await batchFactory.create({
          batchCode: `AUC-B-${Date.now().toString().slice(-4)}-VP`,
          storeId,
          ptId,
          status: AuctionBatchStatusEnum.ValidationPending,
          notes: 'Batch items overdue > 30 days',
        });
        totalBatches++;

        for (const item of batch2Items) {
          await itemFactory.create({
            auctionBatchId: batch.uuid,
            spkItemId: item.uuid,
            pickupStatus: AuctionPickupStatusEnum.Taken, // Already picked up
          });
        }
      }
    }

    console.log(`✅ Seeded ${totalBatches} Auction Batches`);
  }
}
