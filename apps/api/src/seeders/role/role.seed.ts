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

    // ADMIN_PT permissions
    const adminPtPermissions = [
      // READ for Pt, Store, ItemType
      { action: AclAction.READ, subject: AclSubject.PT },
      { action: AclAction.READ, subject: AclSubject.STORE },
      { action: AclAction.READ, subject: AclSubject.ITEM_TYPE },
      // CRUD for User (scoped to PT)
      { action: AclAction.CREATE, subject: AclSubject.USER },
      { action: AclAction.READ, subject: AclSubject.USER },
      { action: AclAction.UPDATE, subject: AclSubject.USER },
      { action: AclAction.DELETE, subject: AclSubject.USER },
      // CRUD for Catalog
      { action: AclAction.CREATE, subject: AclSubject.CATALOG },
      { action: AclAction.READ, subject: AclSubject.CATALOG },
      { action: AclAction.UPDATE, subject: AclSubject.CATALOG },
      { action: AclAction.DELETE, subject: AclSubject.CATALOG },
      // CRUD for PriceDeduction
      { action: AclAction.CREATE, subject: AclSubject.PRICE_DEDUCTION },
      { action: AclAction.READ, subject: AclSubject.PRICE_DEDUCTION },
      { action: AclAction.UPDATE, subject: AclSubject.PRICE_DEDUCTION },
      { action: AclAction.DELETE, subject: AclSubject.PRICE_DEDUCTION },
      // CRUD for Customer
      { action: AclAction.CREATE, subject: AclSubject.CUSTOMER },
      { action: AclAction.READ, subject: AclSubject.CUSTOMER },
      { action: AclAction.UPDATE, subject: AclSubject.CUSTOMER },
      { action: AclAction.DELETE, subject: AclSubject.CUSTOMER },
      // CRUD for SPK
      { action: AclAction.CREATE, subject: AclSubject.SPK },
      { action: AclAction.READ, subject: AclSubject.SPK },
      { action: AclAction.UPDATE, subject: AclSubject.SPK },
      { action: AclAction.DELETE, subject: AclSubject.SPK },
      // CRUD for NKB
      { action: AclAction.CREATE, subject: AclSubject.NKB },
      { action: AclAction.READ, subject: AclSubject.NKB },
      { action: AclAction.UPDATE, subject: AclSubject.NKB },
      { action: AclAction.DELETE, subject: AclSubject.NKB },
      // CRUD for AddCapital
      { action: AclAction.CREATE, subject: AclSubject.ADD_CAPITAL },
      { action: AclAction.READ, subject: AclSubject.ADD_CAPITAL },
      { action: AclAction.UPDATE, subject: AclSubject.ADD_CAPITAL },
      { action: AclAction.DELETE, subject: AclSubject.ADD_CAPITAL },
      // CRUD for DepositMoney
      { action: AclAction.CREATE, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.READ, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.UPDATE, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.DELETE, subject: AclSubject.DEPOSIT_MONEY },
      // READ for Mutation, StockOpnameSchedule, StockOpnameExecution, AuctionBatch, AuctionPickup, AuctionValidation, Report
      { action: AclAction.READ, subject: AclSubject.MUTATION },
      { action: AclAction.READ, subject: AclSubject.STOCK_OPNAME_SCHEDULE },
      { action: AclAction.READ, subject: AclSubject.STOCK_OPNAME_EXECUTION },
      { action: AclAction.READ, subject: AclSubject.AUCTION_BATCH },
      { action: AclAction.READ, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.READ, subject: AclSubject.AUCTION_VALIDATION },
      { action: AclAction.READ, subject: AclSubject.REPORT },
      // CRUD for PriorityRules
      { action: AclAction.CREATE, subject: AclSubject.PRIORITY_RULES },
      { action: AclAction.READ, subject: AclSubject.PRIORITY_RULES },
      { action: AclAction.UPDATE, subject: AclSubject.PRIORITY_RULES },
      { action: AclAction.DELETE, subject: AclSubject.PRIORITY_RULES },
    ];

    // STAFF_TOKO permissions
    const staffTokoPermissions = [
      // READ for ItemType, Catalog, PriceDeduction, DepositMoney, Mutation
      { action: AclAction.READ, subject: AclSubject.ITEM_TYPE },
      { action: AclAction.READ, subject: AclSubject.CATALOG },
      { action: AclAction.READ, subject: AclSubject.PRICE_DEDUCTION },
      { action: AclAction.READ, subject: AclSubject.DEPOSIT_MONEY },
      { action: AclAction.READ, subject: AclSubject.MUTATION },
      // CRUD for Customer
      { action: AclAction.CREATE, subject: AclSubject.CUSTOMER },
      { action: AclAction.READ, subject: AclSubject.CUSTOMER },
      { action: AclAction.UPDATE, subject: AclSubject.CUSTOMER },
      { action: AclAction.DELETE, subject: AclSubject.CUSTOMER },
      // CRUD for SPK
      { action: AclAction.CREATE, subject: AclSubject.SPK },
      { action: AclAction.READ, subject: AclSubject.SPK },
      { action: AclAction.UPDATE, subject: AclSubject.SPK },
      { action: AclAction.DELETE, subject: AclSubject.SPK },
      // CRUD for NKB
      { action: AclAction.CREATE, subject: AclSubject.NKB },
      { action: AclAction.READ, subject: AclSubject.NKB },
      { action: AclAction.UPDATE, subject: AclSubject.NKB },
      { action: AclAction.DELETE, subject: AclSubject.NKB },
      // READ (request) for AddCapital
      { action: AclAction.READ, subject: AclSubject.ADD_CAPITAL },
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

    // STAFF_LELANG permissions
    const staffLelangPermissions = [
      // READ for AuctionBatch, AuctionValidation
      { action: AclAction.READ, subject: AclSubject.AUCTION_BATCH },
      { action: AclAction.READ, subject: AclSubject.AUCTION_VALIDATION },
      // CRUD for AuctionPickup
      { action: AclAction.CREATE, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.READ, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.UPDATE, subject: AclSubject.AUCTION_PICKUP },
      { action: AclAction.DELETE, subject: AclSubject.AUCTION_PICKUP },
    ];

    // STAFF_MARKETING permissions
    const staffMarketingPermissions = [
      // READ for AuctionBatch, AuctionPickup
      { action: AclAction.READ, subject: AclSubject.AUCTION_BATCH },
      { action: AclAction.READ, subject: AclSubject.AUCTION_PICKUP },
      // CRUD for AuctionValidation
      { action: AclAction.CREATE, subject: AclSubject.AUCTION_VALIDATION },
      { action: AclAction.READ, subject: AclSubject.AUCTION_VALIDATION },
      { action: AclAction.UPDATE, subject: AclSubject.AUCTION_VALIDATION },
      { action: AclAction.DELETE, subject: AclSubject.AUCTION_VALIDATION },
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
