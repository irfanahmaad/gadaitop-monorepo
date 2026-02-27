import { Seeder } from '@concepta/typeorm-seeding';
import { subDays } from 'date-fns';

import { NotificationEntity } from '../../modules/notification/entities/notification.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { dataSource } from '../db.seed';
import { NotificationFactory } from './notification.factory';

interface NotificationTemplate {
  title: string;
  body: string;
  type: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  read: boolean;
}

/**
 * Notification Seed
 *
 * Creates sample notifications for each user with role-appropriate content:
 * - Unread notifications (SPK created, NKB pending, etc.)
 * - Read notifications (older items)
 */
export class NotificationSeed extends Seeder {
  async run(): Promise<void> {
    const notificationFactory = this.factory(NotificationFactory);

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const notificationRepo = dataSource.getRepository(NotificationEntity);
    const userRepo = dataSource.getRepository(UserEntity);

    const existingCount = await notificationRepo.count();
    if (existingCount > 0) {
      console.log(`Notifications already exist (${existingCount}), skipping seed`);
      return;
    }

    const users = await userRepo.find({
      relations: ['roles'],
      where: {},
    });

    const templatesByRole: Record<string, NotificationTemplate[]> = {
      owner: [
        { title: 'Sistem Baru', body: 'Selamat datang di sistem Gadai Top. Semua fitur telah siap digunakan.', type: 'info', read: false },
        { title: 'Laporan Bulanan', body: 'Laporan bulan ini sudah tersedia. Silakan periksa dashboard.', type: 'info', read: true },
      ],
      company_admin: [
        { title: 'Permintaan Tambah Modal', body: 'Cabang Jakarta Pusat meminta tambah modal Rp 5.000.000. Silakan tinjau.', type: 'warning', relatedEntityType: 'capital_topup', read: false },
        { title: 'Setor Uang Menunggu', body: 'Ada setor uang dari cabang Bandung yang menunggu konfirmasi.', type: 'info', relatedEntityType: 'cash_deposit', read: false },
        { title: 'SPK Baru', body: '3 SPK baru telah dibuat hari ini.', type: 'info', read: true },
      ],
      branch_staff: [
        { title: 'SPK Berhasil Dibuat', body: 'SPK-001 telah berhasil dibuat dan disimpan.', type: 'success', relatedEntityType: 'spk', read: false },
        { title: 'NKB Pending', body: 'Pembayaran NKB Anda sedang menunggu verifikasi.', type: 'warning', relatedEntityType: 'nkb', read: false },
        { title: 'Tambah Modal Disetujui', body: 'Permintaan tambah modal Rp 10.000.000 telah disetujui.', type: 'success', read: true },
      ],
      stock_auditor: [
        { title: 'Stock Opname Baru', body: 'Sesi stock opname baru telah dibuat. Silakan mulai pemeriksaan.', type: 'info', relatedEntityType: 'stock_opname', read: false },
        { title: 'Pemeriksaan Selesai', body: 'Sesi stock opname kemarin telah selesai dengan baik.', type: 'success', read: true },
      ],
      auction_staff: [
        { title: 'Batch Lelang Baru', body: 'Batch lelang baru menunggu validasi. Silakan periksa item.', type: 'warning', relatedEntityType: 'auction_batch', read: false },
        { title: 'Item Siap Diambil', body: '2 item telah divalidasi dan siap diambil pemenang.', type: 'info', read: true },
      ],
      marketing: [
        { title: 'Lelangan Aktif', body: 'Ada 2 batch lelang aktif yang dapat dipantau.', type: 'info', read: false },
        { title: 'Update Harga', body: 'Harga emas telah diperbarui.', type: 'info', read: true },
      ],
    };

    const defaultTemplates: NotificationTemplate[] = [
      { title: 'Notifikasi Sistem', body: 'Ini adalah notifikasi contoh dari sistem.', type: 'info', read: true },
    ];

    let totalCreated = 0;

    for (const user of users) {
      const roleCodes = user.roles?.map((r) => r.code) ?? [];
      const primaryRole = roleCodes[0] ?? 'branch_staff';
      const templates = templatesByRole[primaryRole] ?? defaultTemplates;

      for (const t of templates) {
        await notificationFactory.create({
          recipientId: user.uuid,
          ptId: user.companyId ?? user.ownedCompanyId ?? null,
          title: t.title,
          body: t.body,
          type: t.type,
          readAt: t.read ? subDays(new Date(), 1) : null,
          relatedEntityType: t.relatedEntityType ?? null,
          relatedEntityId: t.relatedEntityId ?? null,
        });
        totalCreated++;
      }
    }

    console.log(`\n📊 Seeded ${totalCreated} notifications for ${users.length} users`);
  }
}
