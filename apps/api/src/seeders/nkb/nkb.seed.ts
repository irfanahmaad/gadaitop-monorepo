import { Seeder } from '@concepta/typeorm-seeding';
import { subDays } from 'date-fns';

import { NkbRecordEntity } from '../../modules/nkb/entities/nkb-record.entity';
import { SpkRecordEntity } from '../../modules/spk/entities/spk-record.entity';
import { NkbStatusEnum } from '../../constants/nkb-status';
import { NkbPaymentTypeEnum } from '../../constants/nkb-payment-type';
import { NkbPaymentMethodEnum } from '../../constants/nkb-payment-method';
import { SpkStatusEnum } from '../../constants/spk-status';
import { dataSource } from '../db.seed';
import { NkbRecordFactory } from './nkb.factory';

/**
 * NKB Seed
 * 
 * Creates NKB (payment) records for SPK scenarios.
 * - FullRedemption for Redeemed/Closed SPKs
 * - Pending Renewal/Payment for some Active SPKs (for dashboard demo)
 * - Rejected history
 */
export class NkbSeed extends Seeder {
  async run(): Promise<void> {
    const nkbFactory = this.factory(NkbRecordFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const nkbRepo = dataSource.getRepository(NkbRecordEntity);
    const spkRepo = dataSource.getRepository(SpkRecordEntity);

    // Check if NKBs exist
    const existingCount = await nkbRepo.count();
    if (existingCount > 0) {
      console.log(`NKBs already exist (${existingCount}), skipping seed`);
      return;
    }

    // Get relevant SPKs
    const redeemedSpks = await spkRepo.find({ where: { status: SpkStatusEnum.Redeemed } });
    const activeSpks = await spkRepo.find({ where: { status: SpkStatusEnum.Active } });

    if (redeemedSpks.length === 0 && activeSpks.length === 0) {
      console.log('⚠️ No Redeemed or Active SPKs found. Run SpkSeed first.');
      return;
    }

    let totalNkb = 0;

    // 1. Create Confirmed FullRedemption for all Redeemed SPKs
    let i = 0;
    for (const spk of redeemedSpks) {
       i++;
       await nkbFactory.create({
         nkbNumber: `NKB-${spk.spkNumber.split('-')[1]}-${Date.now().toString().slice(-4)}-${i}`,
         spkId: spk.uuid,
         amountPaid: spk.totalAmount, // Assuming full payment
         paymentType: NkbPaymentTypeEnum.FullRedemption,
         paymentMethod: NkbPaymentMethodEnum.Cash,
         status: NkbStatusEnum.Confirmed,
         isCustomerInitiated: false,
         confirmedAt: new Date(), // Just now
         // creator/confirmer would be staff, skipping relations for simplicity or assuming set
       });
       totalNkb++;
    }

    // 2. Create Pending NKBs for some Active SPKs (Demo: Store Staff approval flow)
    // 2. Create Pending NKBs for some Active SPKs (Demo: Store Staff approval flow)
    // Take first 2 active SPKs per company theoretically, but here just take a few random ones
    const demoActiveSpks = activeSpks.slice(0, 3);
    let j = 0;
    for (const spk of demoActiveSpks) {
      j++;
      await nkbFactory.create({
         nkbNumber: `NKB-${spk.spkNumber.split('-')[1]}-${Date.now().toString().slice(-4)}-${j}-PEND`,
         spkId: spk.uuid,
         amountPaid: spk.interestRate, // Assume paying interest only
         paymentType: NkbPaymentTypeEnum.Renewal,
         paymentMethod: NkbPaymentMethodEnum.Transfer,
         status: NkbStatusEnum.Pending,
         isCustomerInitiated: true,
         paymentProofUrl: 'https://placeholder.com/proof.jpg',
       });
       totalNkb++;
    }

    // 3. Create a Rejected NKB for history demo
    if (activeSpks.length > 3) {
      const spk = activeSpks[3];
      await nkbFactory.create({
         nkbNumber: `NKB-${spk.spkNumber.split('-')[1]}-${Date.now().toString().slice(-4)}-REJ`,
         spkId: spk.uuid,
         amountPaid: '50000',
         paymentType: NkbPaymentTypeEnum.Partial,
         paymentMethod: NkbPaymentMethodEnum.Transfer,
         status: NkbStatusEnum.Rejected,
         isCustomerInitiated: true,
         rejectionReason: 'Bukti transfer buram / tidak terbaca',
         confirmedAt: subDays(new Date(), 1),
       });
       totalNkb++;
    }

    console.log(`✅ Seeded ${totalNkb} NKBs`);
  }
}
