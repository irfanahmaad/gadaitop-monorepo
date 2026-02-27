import { Seeder } from '@concepta/typeorm-seeding';

import { SoPriorityRuleEntity } from '../../modules/stock-opname/entities/so-priority-rule.entity';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { ItemTypeEntity } from '../../modules/item-type/entities/item-type.entity';
import { SoPriorityRuleTypeEnum } from '../../constants/so-priority-rule-type';
import { dataSource } from '../db.seed';
import { SoPriorityRuleFactory } from './so-priority-rule.factory';

/**
 * SO Priority Rule Seed (Master Syarat Mata)
 *
 * Creates sample priority rules per company for stock opname ordering:
 * - ItemType rule (prioritize gold/emas items)
 * - ValueThreshold rule (high-value items first)
 * - DaysOverdue rule (overdue items priority)
 */
export class SoPriorityRuleSeed extends Seeder {
  async run(): Promise<void> {
    const ruleFactory = this.factory(SoPriorityRuleFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const ruleRepo = dataSource.getRepository(SoPriorityRuleEntity);
    const companyRepo = dataSource.getRepository(CompanyEntity);
    const itemTypeRepo = dataSource.getRepository(ItemTypeEntity);

    const existingCount = await ruleRepo.count();
    if (existingCount > 0) {
      console.log(`SO priority rules already exist (${existingCount}), skipping seed`);
      return;
    }

    const companies = await companyRepo.find();
    const itemTypes = await itemTypeRepo.find();
    const emasType = itemTypes.find((it) => it.typeCode === 'E');

    if (companies.length === 0) {
      console.log('⚠️ No companies found. Run CompanySeed first.');
      return;
    }

    let totalCreated = 0;

    for (const company of companies) {
      // 1. ItemType rule - Prioritize Emas (gold) items
      if (emasType) {
        await ruleFactory.create({
          ptId: company.uuid,
          ruleName: 'Prioritas Barang Emas',
          ruleType: SoPriorityRuleTypeEnum.ItemType,
          ruleConfig: { itemTypeId: emasType.uuid, itemTypeCode: 'E' },
          priorityLevel: 1,
          isActive: true,
          description: 'Barang emas diperiksa terlebih dahulu',
        });
        totalCreated++;
      }

      // 2. ValueThreshold rule - High value items first
      await ruleFactory.create({
        ptId: company.uuid,
        ruleName: 'Prioritas Nilai Tinggi',
        ruleType: SoPriorityRuleTypeEnum.ValueThreshold,
        ruleConfig: { minValue: 5000000, unit: 'idr' },
        priorityLevel: 2,
        isActive: true,
        description: 'Barang dengan nilai di atas Rp 5.000.000 diperiksa lebih dulu',
      });
      totalCreated++;

      // 3. DaysOverdue rule - Overdue items first
      await ruleFactory.create({
        ptId: company.uuid,
        ruleName: 'Prioritas Jatuh Tempo',
        ruleType: SoPriorityRuleTypeEnum.DaysOverdue,
        ruleConfig: { daysOverdue: 30 },
        priorityLevel: 3,
        isActive: true,
        description: 'Barang yang sudah lewat jatuh tempo 30 hari diprioritaskan',
      });
      totalCreated++;

      // 4. Custom rule - Additional criteria
      await ruleFactory.create({
        ptId: company.uuid,
        ruleName: 'Prioritas Kustom',
        ruleType: SoPriorityRuleTypeEnum.Custom,
        ruleConfig: { criteria: 'storage_location', order: 'asc' },
        priorityLevel: 4,
        isActive: true,
        description: 'Urutan berdasarkan lokasi penyimpanan',
      });
      totalCreated++;
    }

    console.log(`\n📊 Seeded ${totalCreated} SO priority rules across ${companies.length} companies`);
  }
}
