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
import { NkbSeed } from './nkb/nkb.seed';
import { StockOpnameSeed } from './stock-opname/stock-opname.seed';
import { AuctionBatchSeed } from './auction-batch/auction-batch.seed';

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
 * 12. NkbSeed - Payments
 * 13. StockOpnameSeed - Inventory sessions
 * 14. AuctionBatchSeed - Auction batches
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
    NkbSeed,
    StockOpnameSeed,
    AuctionBatchSeed,
  ],
});
