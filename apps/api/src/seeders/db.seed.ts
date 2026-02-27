import 'reflect-metadata';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { SeedingSource } from '@concepta/typeorm-seeding';

import { SnakeNamingStrategy } from '../snake-naming.strategy';
import { BranchSeed } from './branch/branch.seed';
import { CatalogSeed } from './catalog/catalog.seed';
import { CompanySeed } from './company/company.seed';
import { CustomerSeed } from './customer/customer.seed';
import { ItemTypeSeed } from './item-type/item-type.seed';
import { RoleSeed } from './role/role.seed';
import { AdminUsersSeed } from './user/admin-users.seed';
import { UserSeed } from './user/user.seed';

import { PawnTermSeed } from './pawn-term/pawn-term.seed';
import { SpkSeed } from './spk/spk.seed';
import { OverdueSpkSeed } from './spk/overdue-spk.seed';
import { NkbSeed } from './nkb/nkb.seed';
import { StockOpnameSeed } from './stock-opname/stock-opname.seed';
import { AuctionBatchSeed } from './auction-batch/auction-batch.seed';
import { CapitalTopupSeed } from './capital-topup/capital-topup.seed';
import { CashDepositSeed } from './cash-deposit/cash-deposit.seed';
import { CashMutationSeed } from './cash-mutation/cash-mutation.seed';
import { SoPriorityRuleSeed } from './so-priority-rule/so-priority-rule.seed';
import { NotificationSeed } from './notification/notification.seed';

dotenv.config();

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'gadaitop',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
});

/**
 * Seeding order:
 * 1. RoleSeed - Create roles
 * 2. RoleUpdateSeed - Update existing role permissions
 * 3. UserSeed - Super admin user
 * 4. CompanySeed - Default company
 * 5. BranchSeed - Sample branches
 * 6. AdminUsersSeed - Test users per role
 * 7. ItemTypeSeed - Item categories
 * 8. CustomerSeed - Sample customers
 * 9. CatalogSeed - Sample products
 * 10. PawnTermSeed - Lending terms
 * 11. SpkSeed - Pawn contracts
 * 12. OverdueSpkSeed - Supplemental overdue SPKs for Lelangan (Admin PT)
 * 13. NkbSeed - Payments
 * 14. StockOpnameSeed - Inventory sessions
 * 15. AuctionBatchSeed - Auction batches
 * 16. CapitalTopupSeed - Tambah Modal requests
 * 17. CashDepositSeed - Setor Uang deposits
 * 18. CashMutationSeed - Mutasi Transaksi history
 * 19. SoPriorityRuleSeed - Master Syarat Mata rules
 * 20. NotificationSeed - In-app notifications
 */
export default new SeedingSource({
  dataSource,
  seeders: [
    RoleSeed,
    UserSeed,
    CompanySeed,
    BranchSeed,
    AdminUsersSeed,
    ItemTypeSeed,
    CustomerSeed,
    CatalogSeed,
    PawnTermSeed,
    SpkSeed,
    OverdueSpkSeed,
    NkbSeed,
    StockOpnameSeed,
    AuctionBatchSeed,
    CapitalTopupSeed,
    CashDepositSeed,
    CashMutationSeed,
    SoPriorityRuleSeed,
    NotificationSeed,
  ],
});
