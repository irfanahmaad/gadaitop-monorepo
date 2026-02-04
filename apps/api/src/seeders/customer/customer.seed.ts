import { Seeder } from '@concepta/typeorm-seeding';

import { GenderEnum } from '../../constants/gender';
import { CustomerEntity } from '../../modules/customer/entities/customer.entity';
import { CompanyEntity } from '../../modules/company/entities/company.entity';
import { generateHash } from '../../common/utils';
import { dataSource } from '../db.seed';

interface SampleCustomer {
  nik: string;
  pin: string;
  name: string;
  dob: Date;
  gender: GenderEnum;
  address: string;
  city: string;
  phone: string;
  email: string;
  companyCode: string;
}

/**
 * Customer Seed
 * 
 * Creates sample customers for each company.
 * PIN for all: 123456
 */
export class CustomerSeed extends Seeder {
  async run(): Promise<void> {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const customerRepo = dataSource.getRepository(CustomerEntity);
    const companyRepo = dataSource.getRepository(CompanyEntity);

    // Check if customers exist
    const existingCount = await customerRepo.count();
    if (existingCount > 0) {
      console.log(`Customers already exist (${existingCount}), skipping seed`);
      return;
    }

    // Get all companies
    const companies = await companyRepo.find();
    const companyByCode = new Map(companies.map(c => [c.companyCode, c]));

    if (companies.length === 0) {
      console.log('⚠️ No companies found. Run CompanySeed first.');
      return;
    }

    // Hash the default PIN once
    const defaultPinHash = await generateHash('123456');

    // Sample customers for each company
    const sampleCustomers: SampleCustomer[] = [
      // PT001 Customers
      { nik: '3275012501900001', pin: '123456', name: 'Budi Santoso',
        dob: new Date('1990-01-25'), gender: GenderEnum.Male,
        address: 'Jl. Merdeka No. 10, Menteng', city: 'Jakarta Pusat',
        phone: '+6281234567001', email: 'budi.santoso@example.com', companyCode: 'PT001' },
      { nik: '3275014506850002', pin: '123456', name: 'Siti Aminah',
        dob: new Date('1985-06-15'), gender: GenderEnum.Female,
        address: 'Jl. Sudirman No. 25, Setiabudi', city: 'Jakarta Selatan',
        phone: '+6281234567002', email: 'siti.aminah@example.com', companyCode: 'PT001' },
      { nik: '3273011203780003', pin: '123456', name: 'Ahmad Hidayat',
        dob: new Date('1978-03-12'), gender: GenderEnum.Male,
        address: 'Jl. Dago No. 50, Coblong', city: 'Bandung',
        phone: '+6281234567003', email: 'ahmad.hidayat@example.com', companyCode: 'PT001' },
      { nik: '3578012809920004', pin: '123456', name: 'Dewi Putri',
        dob: new Date('1992-09-28'), gender: GenderEnum.Female,
        address: 'Jl. Pemuda No. 100, Genteng', city: 'Surabaya',
        phone: '+6281234567004', email: 'dewi.putri@example.com', companyCode: 'PT001' },
      { nik: '3275010107950005', pin: '123456', name: 'Rizki Pratama',
        dob: new Date('1995-07-01'), gender: GenderEnum.Male,
        address: 'Jl. Thamrin No. 15, Gambir', city: 'Jakarta Pusat',
        phone: '+6281234567005', email: 'rizki.pratama@example.com', companyCode: 'PT001' },
      // PT002 Customers
      { nik: '3674011505880101', pin: '123456', name: 'Eko Wijaya',
        dob: new Date('1988-05-15'), gender: GenderEnum.Male,
        address: 'Jl. Gatot Subroto No. 20', city: 'Jakarta Selatan',
        phone: '+6281234567101', email: 'eko.wijaya@example.com', companyCode: 'PT002' },
      { nik: '3603012208910102', pin: '123456', name: 'Ratna Sari',
        dob: new Date('1991-08-22'), gender: GenderEnum.Female,
        address: 'Jl. BSD No. 88, Serpong', city: 'Tangerang',
        phone: '+6281234567102', email: 'ratna.sari@example.com', companyCode: 'PT002' },
      { nik: '3674013010830103', pin: '123456', name: 'Hendra Kusuma',
        dob: new Date('1983-10-30'), gender: GenderEnum.Male,
        address: 'Jl. Pondok Indah No. 5', city: 'Jakarta Selatan',
        phone: '+6281234567103', email: 'hendra.kusuma@example.com', companyCode: 'PT002' },
      // PT003 Customers
      { nik: '3273022004870201', pin: '123456', name: 'Asep Supriatna',
        dob: new Date('1987-04-20'), gender: GenderEnum.Male,
        address: 'Jl. Soekarno Hatta No. 200', city: 'Bandung',
        phone: '+6281234567201', email: 'asep.supriatna@example.com', companyCode: 'PT003' },
      { nik: '3209011106890202', pin: '123456', name: 'Yanti Permata',
        dob: new Date('1989-06-11'), gender: GenderEnum.Female,
        address: 'Jl. Siliwangi No. 50', city: 'Cirebon',
        phone: '+6281234567202', email: 'yanti.permata@example.com', companyCode: 'PT003' },
    ];

    let created = 0;
    let skipped = 0;

    for (const data of sampleCustomers) {
      const company = companyByCode.get(data.companyCode);
      if (!company) {
        console.log(`  ⚠️ Company ${data.companyCode} not found for ${data.name}`);
        skipped++;
        continue;
      }

      // Create customer entity directly with hashed PIN
      const customer = customerRepo.create({
        nik: data.nik,
        pinHash: defaultPinHash,
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
        ptId: company.uuid,
        isBlacklisted: false,
      });

      await customerRepo.save(customer);
      created++;
    }

    console.log(`\n📊 Seeded ${created} customers, ${skipped} skipped`);
    console.log('   PIN for all: 123456');
  }
}
