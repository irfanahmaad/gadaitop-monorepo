import { Seeder } from '@concepta/typeorm-seeding';

import { ItemTypeEntity } from '../../modules/item-type/entities/item-type.entity';
import { dataSource } from '../db.seed';
import { ItemTypeFactory } from './item-type.factory';

export class ItemTypeSeed extends Seeder {
  async run(): Promise<void> {
    const itemTypeFactory = this.factory(ItemTypeFactory);

    // Initialize dataSource if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // Check if item types already exist
    try {
      const existingItemTypes = await dataSource
        .getRepository(ItemTypeEntity)
        .find();

      if (existingItemTypes.length > 0) {
        console.log('Item types already exist, skipping seed');
        return;
      }
    } catch (error) {
      console.log('Could not check existing item types, proceeding with seed...');
    }

    // Create default item types
    const itemTypes = [
      {
        typeCode: 'H',
        typeName: 'Handphone',
        description: 'Barang elektronik handphone/smartphone',
        isActive: true,
        sortOrder: 1,
        iconUrl: null,
      },
      {
        typeCode: 'L',
        typeName: 'Laptop',
        description: 'Barang elektronik laptop/notebook',
        isActive: true,
        sortOrder: 2,
        iconUrl: null,
      },
      {
        typeCode: 'E',
        typeName: 'Emas',
        description: 'Barang perhiasan emas',
        isActive: true,
        sortOrder: 3,
        iconUrl: null,
      },
      {
        typeCode: 'M',
        typeName: 'Motor',
        description: 'Kendaraan bermotor sepeda motor',
        isActive: true,
        sortOrder: 4,
        iconUrl: null,
      },
      {
        typeCode: 'K',
        typeName: 'Kendaraan',
        description: 'Kendaraan bermotor lainnya (mobil, dll)',
        isActive: true,
        sortOrder: 5,
        iconUrl: null,
      },
      {
        typeCode: 'T',
        typeName: 'TV',
        description: 'Barang elektronik televisi',
        isActive: true,
        sortOrder: 6,
        iconUrl: null,
      },
      {
        typeCode: 'O',
        typeName: 'Lainnya',
        description: 'Barang lainnya yang tidak termasuk kategori di atas',
        isActive: true,
        sortOrder: 99,
        iconUrl: null,
      },
    ];

    await Promise.all(
      itemTypes.map((itemTypeData) => itemTypeFactory.create(itemTypeData)),
    );

    console.log(`✅ Seeded ${itemTypes.length} item types successfully`);
    itemTypes.forEach((itemType) => {
      console.log(`   - ${itemType.typeCode}: ${itemType.typeName}`);
    });
  }
}
