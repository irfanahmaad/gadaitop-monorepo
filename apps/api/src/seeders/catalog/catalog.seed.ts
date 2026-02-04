import { Seeder } from '@concepta/typeorm-seeding';

import { CatalogEntity } from '../../modules/catalog/entities/catalog.entity';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { ItemTypeEntity } from '../../modules/item-type/entities/item-type.entity';
import { dataSource } from '../db.seed';
import { CatalogFactory } from './catalog.factory';

interface SampleCatalog {
  code: string;
  name: string;
  itemTypeCode: string;
  basePrice: string;
  pawnValueMin: string;
  pawnValueMax: string;
  tenorOptions: number[];
  description: string;
}

/**
 * Catalog Seed
 * 
 * Creates sample catalogs for all companies.
 * All companies get the same catalog items.
 */
export class CatalogSeed extends Seeder {
  async run(): Promise<void> {
    const catalogFactory = this.factory(CatalogFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const catalogRepo = dataSource.getRepository(CatalogEntity);
    const companyRepo = dataSource.getRepository(CompanyEntity);
    const itemTypeRepo = dataSource.getRepository(ItemTypeEntity);

    // Check if catalogs exist
    const existingCount = await catalogRepo.count();
    if (existingCount > 0) {
      console.log(`Catalogs already exist (${existingCount}), skipping seed`);
      return;
    }

    // Get all companies
    const companies = await companyRepo.find();
    if (companies.length === 0) {
      console.log('⚠️ No companies found');
      return;
    }

    // Get all item types
    const itemTypes = await itemTypeRepo.find();
    const itemTypeByCode = new Map(itemTypes.map(it => [it.typeCode, it]));

    // Sample catalog template
    const catalogTemplate: SampleCatalog[] = [
      // Emas (Gold)
      { code: 'E-24K-1G', name: 'Emas 24K 1 Gram', itemTypeCode: 'E',
        basePrice: '1000000', pawnValueMin: '700000', pawnValueMax: '900000',
        tenorOptions: [7, 14, 30], description: 'Emas murni 24 karat 1 gram' },
      { code: 'E-24K-5G', name: 'Emas 24K 5 Gram', itemTypeCode: 'E',
        basePrice: '5000000', pawnValueMin: '3500000', pawnValueMax: '4500000',
        tenorOptions: [7, 14, 30], description: 'Emas murni 24 karat 5 gram' },
      { code: 'E-22K-10G', name: 'Perhiasan Emas 22K 10 Gram', itemTypeCode: 'E',
        basePrice: '8500000', pawnValueMin: '6000000', pawnValueMax: '7500000',
        tenorOptions: [7, 14, 30], description: 'Perhiasan emas 22 karat 10 gram' },
      // Handphone
      { code: 'H-IPH15PM', name: 'iPhone 15 Pro Max', itemTypeCode: 'H',
        basePrice: '20000000', pawnValueMin: '12000000', pawnValueMax: '16000000',
        tenorOptions: [7, 14, 30], description: 'Apple iPhone 15 Pro Max 256GB' },
      { code: 'H-S24U', name: 'Samsung Galaxy S24 Ultra', itemTypeCode: 'H',
        basePrice: '18000000', pawnValueMin: '10000000', pawnValueMax: '14000000',
        tenorOptions: [7, 14, 30], description: 'Samsung Galaxy S24 Ultra 256GB' },
      { code: 'H-XIR13', name: 'Xiaomi Redmi 13', itemTypeCode: 'H',
        basePrice: '2500000', pawnValueMin: '1000000', pawnValueMax: '1800000',
        tenorOptions: [7, 14, 30], description: 'Xiaomi Redmi 13 128GB' },
      // Laptop
      { code: 'L-MBP14', name: 'MacBook Pro 14"', itemTypeCode: 'L',
        basePrice: '30000000', pawnValueMin: '18000000', pawnValueMax: '24000000',
        tenorOptions: [14, 30], description: 'Apple MacBook Pro 14 M3 Pro' },
      { code: 'L-ASUS15', name: 'ASUS ROG Strix G15', itemTypeCode: 'L',
        basePrice: '18000000', pawnValueMin: '10000000', pawnValueMax: '14000000',
        tenorOptions: [14, 30], description: 'ASUS ROG Strix G15 Gaming' },
      // Motor
      { code: 'M-BEAT22', name: 'Honda Beat 2022', itemTypeCode: 'M',
        basePrice: '15000000', pawnValueMin: '8000000', pawnValueMax: '12000000',
        tenorOptions: [30], description: 'Honda Beat Street 2022' },
      { code: 'M-NMAX23', name: 'Yamaha NMAX 2023', itemTypeCode: 'M',
        basePrice: '30000000', pawnValueMin: '18000000', pawnValueMax: '24000000',
        tenorOptions: [30], description: 'Yamaha NMAX 155 Connected 2023' },
      // TV
      { code: 'T-SAM55', name: 'Samsung Smart TV 55"', itemTypeCode: 'T',
        basePrice: '8000000', pawnValueMin: '4000000', pawnValueMax: '6000000',
        tenorOptions: [14, 30], description: 'Samsung Crystal UHD 55 4K' },
    ];

    let totalCreated = 0;

    for (const company of companies) {
      let companyCreated = 0;

      for (const data of catalogTemplate) {
        const itemType = itemTypeByCode.get(data.itemTypeCode);
        if (!itemType) continue;

        await catalogFactory.create({
          code: data.code,
          name: data.name,
          ptId: company.uuid,
          itemTypeId: itemType.uuid,
          basePrice: data.basePrice,
          pawnValueMin: data.pawnValueMin,
          pawnValueMax: data.pawnValueMax,
          tenorOptions: data.tenorOptions,
          description: data.description,
        });
        companyCreated++;
      }
      
      console.log(`  ✅ ${company.companyCode}: ${companyCreated} catalogs`);
      totalCreated += companyCreated;
    }

    console.log(`\n📊 Seeded ${totalCreated} catalogs across ${companies.length} companies`);
  }
}
