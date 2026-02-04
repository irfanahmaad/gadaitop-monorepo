import { Seeder } from '@concepta/typeorm-seeding';

import { AclAction, AclSubject } from '../../constants/acl';
import { RoleEntity } from '../../modules/role/entities/role.entity';
import { dataSource } from '../db.seed';
import { RoleFactory } from './role.factory';

interface IRole {
  name: string;
  code: string;
  permissions: Array<{
    action: AclAction;
    subject: AclSubject;
    condition?: unknown;
  }>;
}

export class RoleSeed extends Seeder {
  async run(): Promise<void> {
    const roleFactory = this.factory(RoleFactory);

    // Initialize dataSource if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

      // Check if roles already exist
      try {
        const existingRoles = await dataSource
          .getRepository(RoleEntity)
          .find({ where: [{ code: 'owner' }] });

        if (existingRoles.length > 0) {
          console.log('Roles already exist, skipping seed');
          return;
        }
      } catch (error) {
        // If we can't check, continue with seeding (unique constraints will handle duplicates)
        console.log('Could not check existing roles, proceeding with seed...');
      }

    // SUPER_ADMIN permissions
    const superAdminPermissions = [
      { action: AclAction.MANAGE, subject: AclSubject.ALL },
    ];

    // ADMIN_PT permissions (per roles-and-permissions.md spec)
    const adminPtPermissions = [
      // PT - Read own PT
      { action: AclAction.READ, subject: AclSubject.PT },
      // Store - CRUD for branches
      { action: AclAction.CREATE, subject: AclSubject.STORE },
      { action: AclAction.READ, subject: AclSubject.STORE },
      { action: AclAction.UPDATE, subject: AclSubject.STORE },
      { action: AclAction.DELETE, subject: AclSubject.STORE },
      // ItemType - Read only
      { action: AclAction.READ, subject: AclSubject.ITEM_TYPE },
      // User - CRUD for PT users
      { action: AclAction.CREATE, subject: AclSubject.USER },
      { action: AclAction.READ, subject: AclSubject.USER },
      { action: AclAction.UPDATE, subject: AclSubject.USER },
      { action: AclAction.DELETE, subject: AclSubject.USER },
      // Catalog - CRUD
      { action: AclAction.CREATE, subject: AclSubject.CATALOG },
      { action: AclAction.READ, subject: AclSubject.CATALOG },
      { action: AclAction.UPDATE, subject: AclSubject.CATALOG },
      { action: AclAction.DELETE, subject: AclSubject.CATALOG },
      // PriceDeduction - CRUD
      { action: AclAction.CREATE, subject: AclSubject.PRICE_DEDUCTION },
      { action: AclAction.READ, subject: AclSubject.PRICE_DEDUCTION },
      { action: AclAction.UPDATE, subject: AclSubject.PRICE_DEDUCTION },
      { action: AclAction.DELETE, subject: AclSubject.PRICE_DEDUCTION },
      // Customer - READ + UPDATE only (view, change PIN)
      { action: AclAction.READ, subject: AclSubject.CUSTOMER },
      { action: AclAction.UPDATE, subject: AclSubject.CUSTOMER },
      // SPK - READ only (view for oversight)
      { action: AclAction.READ, subject: AclSubject.SPK },
      // NKB - READ only (view for oversight)
      { action: AclAction.READ, subject: AclSubject.NKB },
      // AddCapital - CRUD (approve/reject requests)
      { action: AclAction.CREATE, subject: AclSubject.ADD_CAPITAL },
      { action: AclAction.READ, subject: AclSubject.ADD_CAPITAL },
      { action: AclAction.UPDATE, subject: AclSubject.ADD_CAPITAL },
      { action: AclAction.DELETE, subject: AclSubject.ADD_CAPITAL },
      // DepositMoney - CRUD (approve/reject deposits)
      { action: AclAction.CREATE, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.READ, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.UPDATE, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.DELETE, subject: AclSubject.DEPOSIT_MONEY },
      // Mutation - Read only
      { action: AclAction.READ, subject: AclSubject.MUTATION },
      // StockOpname Schedule - CRUD
      { action: AclAction.CREATE, subject: AclSubject.STOCK_OPNAME_SCHEDULE },
      { action: AclAction.READ, subject: AclSubject.STOCK_OPNAME_SCHEDULE },
      { action: AclAction.UPDATE, subject: AclSubject.STOCK_OPNAME_SCHEDULE },
      { action: AclAction.DELETE, subject: AclSubject.STOCK_OPNAME_SCHEDULE },
      // StockOpname Execution - Read only
      { action: AclAction.READ, subject: AclSubject.STOCK_OPNAME_EXECUTION },
      // PriorityRules - CRUD
      { action: AclAction.CREATE, subject: AclSubject.PRIORITY_RULES },
      { action: AclAction.READ, subject: AclSubject.PRIORITY_RULES },
      { action: AclAction.UPDATE, subject: AclSubject.PRIORITY_RULES },
      { action: AclAction.DELETE, subject: AclSubject.PRIORITY_RULES },
      // AuctionBatch - CRUD
      { action: AclAction.CREATE, subject: AclSubject.AUCTION_BATCH },
      { action: AclAction.READ, subject: AclSubject.AUCTION_BATCH },
      { action: AclAction.UPDATE, subject: AclSubject.AUCTION_BATCH },
      { action: AclAction.DELETE, subject: AclSubject.AUCTION_BATCH },
      // AuctionPickup/Validation - Read only
      { action: AclAction.READ, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.READ, subject: AclSubject.AUCTION_VALIDATION },
      // Report - Read only
      { action: AclAction.READ, subject: AclSubject.REPORT },
      // LockUnlockData - CRUD
      { action: AclAction.CREATE, subject: AclSubject.LOCK_UNLOCK_DATA },
      { action: AclAction.READ, subject: AclSubject.LOCK_UNLOCK_DATA },
      { action: AclAction.UPDATE, subject: AclSubject.LOCK_UNLOCK_DATA },
      { action: AclAction.DELETE, subject: AclSubject.LOCK_UNLOCK_DATA },
    ];

    // STORE_STAFF permissions (per roles-and-permissions.md spec)
    const staffTokoPermissions = [
      // ItemType, Catalog, PriceDeduction - Read only
      { action: AclAction.READ, subject: AclSubject.ITEM_TYPE },
      { action: AclAction.READ, subject: AclSubject.CATALOG },
      { action: AclAction.READ, subject: AclSubject.PRICE_DEDUCTION },
      // Customer - CRUD
      { action: AclAction.CREATE, subject: AclSubject.CUSTOMER },
      { action: AclAction.READ, subject: AclSubject.CUSTOMER },
      { action: AclAction.UPDATE, subject: AclSubject.CUSTOMER },
      { action: AclAction.DELETE, subject: AclSubject.CUSTOMER },
      // SPK - CRUD
      { action: AclAction.CREATE, subject: AclSubject.SPK },
      { action: AclAction.READ, subject: AclSubject.SPK },
      { action: AclAction.UPDATE, subject: AclSubject.SPK },
      { action: AclAction.DELETE, subject: AclSubject.SPK },
      // NKB - CRUD
      { action: AclAction.CREATE, subject: AclSubject.NKB },
      { action: AclAction.READ, subject: AclSubject.NKB },
      { action: AclAction.UPDATE, subject: AclSubject.NKB },
      { action: AclAction.DELETE, subject: AclSubject.NKB },
      // AddCapital - CRU (create, read, update pending requests)
      { action: AclAction.CREATE, subject: AclSubject.ADD_CAPITAL },
      { action: AclAction.READ, subject: AclSubject.ADD_CAPITAL },
      { action: AclAction.UPDATE, subject: AclSubject.ADD_CAPITAL },
      // DepositMoney - CRU (create, read, update pending requests)
      { action: AclAction.CREATE, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.READ, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.UPDATE, subject: AclSubject.DEPOSIT_MONEY },
      // Mutation - Read only
      { action: AclAction.READ, subject: AclSubject.MUTATION },
    ];

    // STOCK_OPNAME permissions
    const stockOpnamePermissions = [
      // READ for StockOpnameSchedule, PriorityRules
      { action: AclAction.READ, subject: AclSubject.STOCK_OPNAME_SCHEDULE },
      { action: AclAction.READ, subject: AclSubject.PRIORITY_RULES },
      // CRUD for StockOpnameExecution
      { action: AclAction.CREATE, subject: AclSubject.STOCK_OPNAME_EXECUTION },
      { action: AclAction.READ, subject: AclSubject.STOCK_OPNAME_EXECUTION },
      { action: AclAction.UPDATE, subject: AclSubject.STOCK_OPNAME_EXECUTION },
      { action: AclAction.DELETE, subject: AclSubject.STOCK_OPNAME_EXECUTION },
    ];

    // AUCTION_STAFF permissions (per roles-and-permissions.md spec)
    const staffLelangPermissions = [
      // AuctionBatch - Read only
      { action: AclAction.READ, subject: AclSubject.AUCTION_BATCH },
      // AuctionPickup - CRUD (manage pickup process)
      { action: AclAction.CREATE, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.READ, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.UPDATE, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.DELETE, subject: AclSubject.AUCTION_PICKUP },
      // AuctionValidation - CRUD (validate items, approve/reject)
      { action: AclAction.CREATE, subject: AclSubject.AUCTION_VALIDATION },
      { action: AclAction.READ, subject: AclSubject.AUCTION_VALIDATION },
      { action: AclAction.UPDATE, subject: AclSubject.AUCTION_VALIDATION },
      { action: AclAction.DELETE, subject: AclSubject.AUCTION_VALIDATION },
    ];

    // MARKETING_STAFF permissions (per roles-and-permissions.md spec)
    const staffMarketingPermissions = [
      // Auction - READ ONLY (view batches, pickups, validations)
      { action: AclAction.READ, subject: AclSubject.AUCTION_BATCH },
      { action: AclAction.READ, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.READ, subject: AclSubject.AUCTION_VALIDATION },
      // MarketingNote - CRUD (marketing-specific content only)
      { action: AclAction.CREATE, subject: AclSubject.MARKETING_NOTE },
      { action: AclAction.READ, subject: AclSubject.MARKETING_NOTE },
      { action: AclAction.UPDATE, subject: AclSubject.MARKETING_NOTE },
      { action: AclAction.DELETE, subject: AclSubject.MARKETING_NOTE },
    ];

    const roles: IRole[] = [
      {
        name: 'Pemilik / Super Admin',
        code: 'owner',
        permissions: superAdminPermissions,
      },
      {
        name: 'Admin PT',
        code: 'company_admin',
        permissions: adminPtPermissions,
      },
      {
        name: 'Staff Toko',
        code: 'branch_staff',
        permissions: staffTokoPermissions,
      },
      {
        name: 'Stock Opname',
        code: 'stock_auditor',
        permissions: stockOpnamePermissions,
      },
      {
        name: 'Lelang',
        code: 'auction_staff',
        permissions: staffLelangPermissions,
      },
      {
        name: 'Marketing',
        code: 'marketing',
        permissions: staffMarketingPermissions,
      },
    ];

    await Promise.all(
      roles.map((role) =>
        roleFactory.create({
          name: role.name,
          code: role.code,
          description: `System role: ${role.name}`,
          permissions: role.permissions,
          isSystemRole: true,
          isActive: true,
        }),
      ),
    );

    console.log(`✅ Seeded ${roles.length} roles successfully`);
  }
}
