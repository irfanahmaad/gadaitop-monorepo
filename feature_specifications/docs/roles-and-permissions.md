# Gadaitop CMS - Roles and Permissions Specification

**Version:** 1.1  
**Last Updated:** 2026-02-04  
**Document Purpose:** Complete RBAC (Role-Based Access Control) specification for API implementation using CASL  
**Status:** ✅ Verified against feature specifications

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Role Definitions](#role-definitions)
3. [Permission Matrix Summary](#permission-matrix-summary)
4. [Detailed Permissions by Role](#detailed-permissions-by-role)
5. [Subject (Resource) Definitions](#subject-resource-definitions)
6. [Action Definitions](#action-definitions)
7. [Implementation Reference](#implementation-reference)

---

## Overview

Gadaitop uses **CASL** (`@casl/ability`) for Role-Based Access Control. The system supports **7 user roles** with varying permission scopes:

| Role | Code | Scope | Description |
|------|------|-------|-------------|
| Super Admin (Owner) | `owner` | Global (all PTs) | System owner with full access |
| Admin PT | `company_admin` | PT-level | Company administrator |
| Store Staff | `branch_staff` | Store-level | Branch/store operations |
| Stock Opname Staff | `stock_auditor` | Assigned SO sessions | Inventory counting |
| Auction Staff | `auction_staff` | Assigned auction batches | Auction item validation |
| Marketing Staff | `marketing` | Assigned auction batches | Marketing notes/assets |
| Customer | `customer` | Own data only | Self-service portal |

---

## Role Definitions

### 1. Super Admin (Owner) - `owner`

**Scope:** Global access across all PTs and system-level operations.

**Description:** The system owner/super administrator who manages the entire platform, including PT (company) creation, super admin user management, and global system settings.

**Key Responsibilities:**
- Create and manage PTs (companies)
- Create and manage other Super Admins
- Manage global Item Types
- View global dashboards and reports

---

### 2. Admin PT - `company_admin`

**Scope:** PT (Company) level - manages single PT and all its branches.

**Description:** Company administrator who oversees all operations within their assigned PT, including stores, users, catalogs, and financial approvals.

**Key Responsibilities:**
- Manage stores/branches within their PT
- Manage PT users (Staff, SO, Auction, Marketing)
- Configure catalogs and pawn terms
- View and approve financial transactions
- Schedule stock opname sessions
- Manage auction batches
- Generate PT-scoped reports

---

### 3. Store Staff - `branch_staff`

**Scope:** Single store/branch level operations.

**Description:** Front-line staff who handle day-to-day customer transactions at a specific store.

**Key Responsibilities:**
- Manage customer data (CRUD)
- Create and manage SPK (pawn contracts)
- Process NKB (payments) - confirm/reject
- Create cash deposit and capital top-up requests
- View cash mutations

---

### 4. Stock Opname Staff - `stock_auditor`

**Scope:** Assigned stock opname sessions only.

**Description:** Staff dedicated to physical inventory counting and condition assessment.

**Key Responsibilities:**
- View assigned SO schedules
- Execute stock counting (create/update execution records)
- Record item conditions
- QR code scanning

---

### 5. Auction Staff - `auction_staff`

**Scope:** Assigned auction batches only.

**Description:** Staff responsible for **validating auction items** and managing the pickup process before auction.

**Key Responsibilities:**
- View auction batches assigned to them
- Validate auction items (approve/reject for auction)
- Record item condition changes and photos
- Manage QR code scanning for items
- Submit validation results

---

### 6. Marketing Staff - `marketing`

**Scope:** Assigned auction batches only (READ-ONLY for auction data).

**Description:** Staff responsible for **marketing activities** for auction items. Cannot modify auction/validation status.

**Key Responsibilities:**
- View auction batches and items (read-only)
- Add marketing notes and campaign information
- Upload marketing assets (photos, documents)
- Download QR codes for promotional materials

> **Note:** Marketing Staff cannot validate items or change auction status. They only add marketing-specific metadata.

---

### 7. Customer - `customer`

> **Note:** Customer role uses separate authentication (NIK/PIN) and is handled differently from internal users.

**Scope:** Own data only.

**Description:** End customer who pawns items and uses the self-service portal.

**Key Responsibilities:**
- View own profile
- View own SPK list and details
- Initiate and confirm payments

---

## Permission Matrix Summary

| Subject | Super Admin | Admin PT | Store Staff | SO Staff | Auction Staff | Marketing Staff |
|---------|:-----------:|:--------:|:-----------:|:--------:|:-------------:|:---------------:|
| All | ✅ MANAGE | ❌ | ❌ | ❌ | ❌ | ❌ |
| User | ❌ | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| Pt | ✅ CRUD | 👁️ READ | ❌ | ❌ | ❌ | ❌ |
| Store | ❌ | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| ItemType | ✅ CRUD | 👁️ READ | 👁️ READ | ❌ | ❌ | ❌ |
| Catalog | ❌ | ✅ CRUD | 👁️ READ | ❌ | ❌ | ❌ |
| PriceDeduction | ❌ | ✅ CRUD | 👁️ READ | ❌ | ❌ | ❌ |
| Customer | ❌ | 👁️ R+U ¹ | ✅ CRUD | ❌ | ❌ | ❌ |
| Spk | ❌ | 👁️ READ ² | ✅ CRUD | ❌ | ❌ | ❌ |
| Nkb | ❌ | 👁️ READ ² | ✅ CRUD | ❌ | ❌ | ❌ |
| AddCapital | ❌ | ✅ CRUD ³ | ✅ CRU ⁴ | ❌ | ❌ | ❌ |
| DepositMoney | ❌ | ✅ CRUD ³ | ✅ CRU ⁴ | ❌ | ❌ | ❌ |
| Mutation | ❌ | 👁️ READ | 👁️ READ | ❌ | ❌ | ❌ |
| StockOpnameSchedule | ❌ | ✅ CRUD | ❌ | 👁️ READ | ❌ | ❌ |
| StockOpnameExecution | ❌ | 👁️ READ | ❌ | ✅ CRUD | ❌ | ❌ |
| PriorityRules | ❌ | ✅ CRUD | ❌ | 👁️ READ | ❌ | ❌ |
| AuctionBatch | ❌ | ✅ CRUD | ❌ | ❌ | 👁️ READ | 👁️ READ |
| AuctionPickup | ❌ | 👁️ READ | ❌ | ❌ | ✅ CRUD ⁵ | 👁️ READ |
| AuctionValidation | ❌ | 👁️ READ | ❌ | ❌ | ✅ CRUD ⁵ | 👁️ READ ⁶ |
| MarketingNote | ❌ | 👁️ READ | ❌ | ❌ | ❌ | ✅ CRUD ⁶ |
| Report | ✅ CRUD | 👁️ READ | ❌ | ❌ | ❌ | ❌ |
| LockUnlockData | ❌ | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |

**Footnotes:**
1. **R+U**: Admin PT can READ customers and UPDATE (change PIN), but NOT create/delete
2. Admin PT views SPK/NKB for oversight; Store Staff performs transactions
3. Admin PT approves/rejects financial requests
4. **CRU**: Store Staff can Create, Read, Update (pending requests only), but not Delete
5. Auction Staff validates items and manages pickup process
6. Marketing Staff can only add marketing notes/assets, cannot modify auction validation

**Legend:**
- ✅ MANAGE = Full control (all actions)
- ✅ CRUD = Create, Read, Update, Delete
- 👁️ READ = Read-only access
- ❌ = No access

---

## Detailed Permissions by Role

### Super Admin (`owner`)

```typescript
permissions: [
  { action: 'manage', subject: 'All' }
]
```

> Using CASL's `manage` + `All` grants complete access to everything.

---

### Admin PT (`company_admin`)

```typescript
permissions: [
  // PT & Store - Read own PT, manage stores
  { action: 'read', subject: 'Pt' },
  { action: 'create', subject: 'Store' },
  { action: 'read', subject: 'Store' },
  { action: 'update', subject: 'Store' },
  { action: 'delete', subject: 'Store' },
  
  // Item Types - Read only
  { action: 'read', subject: 'ItemType' },
  
  // User Management - CRUD for PT users
  { action: 'create', subject: 'User' },
  { action: 'read', subject: 'User' },
  { action: 'update', subject: 'User' },
  { action: 'delete', subject: 'User' },
  
  // Catalog & Pricing - Full CRUD
  { action: 'create', subject: 'Catalog' },
  { action: 'read', subject: 'Catalog' },
  { action: 'update', subject: 'Catalog' },
  { action: 'delete', subject: 'Catalog' },
  { action: 'create', subject: 'PriceDeduction' },
  { action: 'read', subject: 'PriceDeduction' },
  { action: 'update', subject: 'PriceDeduction' },
  { action: 'delete', subject: 'PriceDeduction' },
  
  // Customer Management - READ + UPDATE only (view, change PIN)
  // Note: Store Staff handles Customer CRUD, Admin PT only views and changes PIN
  { action: 'read', subject: 'Customer' },
  { action: 'update', subject: 'Customer' },
  
  // SPK - READ only (view all, filter, history)
  // Note: Store Staff creates SPK, Admin PT views for oversight
  { action: 'read', subject: 'Spk' },
  
  // NKB - READ only (view all, history)
  // Note: Store Staff processes NKB, Admin PT views for oversight
  { action: 'read', subject: 'Nkb' },
  
  // Financial - Full CRUD for Capital & Deposits
  { action: 'create', subject: 'AddCapital' },
  { action: 'read', subject: 'AddCapital' },
  { action: 'update', subject: 'AddCapital' },
  { action: 'delete', subject: 'AddCapital' },
  { action: 'create', subject: 'DepositMoney' },
  { action: 'read', subject: 'DepositMoney' },
  { action: 'update', subject: 'DepositMoney' },
  { action: 'delete', subject: 'DepositMoney' },
  
  // Mutations - Read only
  { action: 'read', subject: 'Mutation' },
  
  // Stock Opname - Schedule (CRUD) + View Execution
  { action: 'create', subject: 'StockOpnameSchedule' },
  { action: 'read', subject: 'StockOpnameSchedule' },
  { action: 'update', subject: 'StockOpnameSchedule' },
  { action: 'delete', subject: 'StockOpnameSchedule' },
  { action: 'read', subject: 'StockOpnameExecution' },
  
  // Priority Rules - Full CRUD
  { action: 'create', subject: 'PriorityRules' },
  { action: 'read', subject: 'PriorityRules' },
  { action: 'update', subject: 'PriorityRules' },
  { action: 'delete', subject: 'PriorityRules' },
  
  // Auction - Batch CRUD, View Pickup/Validation
  { action: 'create', subject: 'AuctionBatch' },
  { action: 'read', subject: 'AuctionBatch' },
  { action: 'update', subject: 'AuctionBatch' },
  { action: 'delete', subject: 'AuctionBatch' },
  { action: 'read', subject: 'AuctionPickup' },
  { action: 'read', subject: 'AuctionValidation' },
  
  // Reports - Read only
  { action: 'read', subject: 'Report' },
  
  // Lock/Unlock - Full control
  { action: 'create', subject: 'LockUnlockData' },
  { action: 'read', subject: 'LockUnlockData' },
  { action: 'update', subject: 'LockUnlockData' },
  { action: 'delete', subject: 'LockUnlockData' },
]
```

---

### Store Staff (`branch_staff`)

```typescript
permissions: [
  // Item Types, Catalog, Pricing - Read only
  { action: 'read', subject: 'ItemType' },
  { action: 'read', subject: 'Catalog' },
  { action: 'read', subject: 'PriceDeduction' },
  
  // Customer Management - Full CRUD
  { action: 'create', subject: 'Customer' },
  { action: 'read', subject: 'Customer' },
  { action: 'update', subject: 'Customer' },
  { action: 'delete', subject: 'Customer' },
  
  // SPK - Full CRUD
  { action: 'create', subject: 'Spk' },
  { action: 'read', subject: 'Spk' },
  { action: 'update', subject: 'Spk' },
  { action: 'delete', subject: 'Spk' },
  
  // NKB - Full CRUD
  { action: 'create', subject: 'Nkb' },
  { action: 'read', subject: 'Nkb' },
  { action: 'update', subject: 'Nkb' },
  { action: 'delete', subject: 'Nkb' },
  
  // Financial - Create, Read, Update (pending requests)
  // Store Staff creates requests and edits pending ones; Admin PT approves
  { action: 'create', subject: 'AddCapital' },
  { action: 'read', subject: 'AddCapital' },
  { action: 'update', subject: 'AddCapital' },
  { action: 'create', subject: 'DepositMoney' },
  { action: 'read', subject: 'DepositMoney' },
  { action: 'update', subject: 'DepositMoney' },
  
  // Mutations - Read only
  { action: 'read', subject: 'Mutation' },
]
```

---

### Stock Opname Staff (`stock_auditor`)

```typescript
permissions: [
  // Stock Opname - View schedules, Execute counting
  { action: 'read', subject: 'StockOpnameSchedule' },
  { action: 'create', subject: 'StockOpnameExecution' },
  { action: 'read', subject: 'StockOpnameExecution' },
  { action: 'update', subject: 'StockOpnameExecution' },
  { action: 'delete', subject: 'StockOpnameExecution' },
  
  // Priority Rules - Read only
  { action: 'read', subject: 'PriorityRules' },
]
```

---

### Auction Staff (`auction_staff`)

```typescript
permissions: [
  // Auction Batches - View assigned batches
  { action: 'read', subject: 'AuctionBatch' },
  
  // Auction Pickup - Manage pickup process
  { action: 'create', subject: 'AuctionPickup' },
  { action: 'read', subject: 'AuctionPickup' },
  { action: 'update', subject: 'AuctionPickup' },
  { action: 'delete', subject: 'AuctionPickup' },
  
  // Auction Validation - Full CRUD (validate items, approve/reject for auction)
  { action: 'create', subject: 'AuctionValidation' },
  { action: 'read', subject: 'AuctionValidation' },
  { action: 'update', subject: 'AuctionValidation' },
  { action: 'delete', subject: 'AuctionValidation' },
]
```

---

### Marketing Staff (`marketing`)

```typescript
permissions: [
  // Auction - View batches, pickups, validations (READ ONLY)
  { action: 'read', subject: 'AuctionBatch' },
  { action: 'read', subject: 'AuctionPickup' },
  { action: 'read', subject: 'AuctionValidation' },
  
  // Marketing Notes - CRUD for marketing-specific content only
  // Note: Marketing Staff cannot modify auction status or validation
  { action: 'create', subject: 'MarketingNote' },
  { action: 'read', subject: 'MarketingNote' },
  { action: 'update', subject: 'MarketingNote' },
  { action: 'delete', subject: 'MarketingNote' },
]
```

> **Important:** Marketing Staff has READ-ONLY access to auction data. They can only create/edit marketing notes and upload marketing assets. They cannot approve/reject items for auction.

---

## Subject (Resource) Definitions

These are the ACL subjects that must be defined in the API:

```typescript
export enum AclSubject {
  // Core
  ALL = 'All',
  USER = 'User',
  
  // Organization
  PT = 'Pt',
  STORE = 'Store',
  
  // Master Data
  ITEM_TYPE = 'ItemType',
  CATALOG = 'Catalog',
  PRICE_DEDUCTION = 'PriceDeduction',
  CUSTOMER = 'Customer',
  
  // Transactions
  SPK = 'Spk',
  NKB = 'Nkb',
  
  // Financial
  ADD_CAPITAL = 'AddCapital',
  DEPOSIT_MONEY = 'DepositMoney',
  MUTATION = 'Mutation',
  
  // Stock Opname
  STOCK_OPNAME_SCHEDULE = 'StockOpnameSchedule',
  STOCK_OPNAME_EXECUTION = 'StockOpnameExecution',
  PRIORITY_RULES = 'PriorityRules',
  
  // Auction
  AUCTION_BATCH = 'AuctionBatch',
  AUCTION_PICKUP = 'AuctionPickup',
  AUCTION_VALIDATION = 'AuctionValidation',
  MARKETING_NOTE = 'MarketingNote',  // NEW: Separate subject for marketing content
  
  // System
  REPORT = 'Report',
  LOCK_UNLOCK_DATA = 'LockUnlockData',
}
```

---

## Action Definitions

Standard CRUD actions plus special actions:

```typescript
export enum AclAction {
  MANAGE = 'manage',  // All actions (CASL special)
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',      // Alias for READ (optional)
}
```

---

## Implementation Reference

### Controller Decorator Usage

Use the `@Auth()` decorator with proper permissions on each endpoint:

```typescript
import { Auth } from '../../decorators';
import { AclAction, AclSubject } from '../../constants/acl';

@Controller('customers')
export class CustomerController {
  
  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.CUSTOMER }])
  async findAll() { ... }
  
  @Post()
  @Auth([{ action: AclAction.CREATE, subject: AclSubject.CUSTOMER }])
  async create() { ... }
  
  @Patch(':id')
  @Auth([{ action: AclAction.UPDATE, subject: AclSubject.CUSTOMER }])
  async update() { ... }
  
  @Delete(':id')
  @Auth([{ action: AclAction.DELETE, subject: AclSubject.CUSTOMER }])
  async remove() { ... }
}
```

### Endpoint to Subject Mapping

| Endpoint | Subject | Actions |
|----------|---------|---------|
| `/v1/users` | `User` | CRUD |
| `/v1/companies` | `Pt` | CRUD |
| `/v1/branches` | `Store` | CRUD |
| `/v1/item-types` | `ItemType` | CRUD |
| `/v1/catalogs` | `Catalog` | CRUD |
| `/v1/customers` | `Customer` | CRUD |
| `/v1/spk` | `Spk` | CRUD |
| `/v1/nkb` | `Nkb` | CRUD |
| `/v1/capital-topups` | `AddCapital` | CRUD |
| `/v1/cash-deposits` | `DepositMoney` | CRUD |
| `/v1/cash-mutations` | `Mutation` | READ |
| `/v1/stock-opname` | `StockOpnameSchedule` / `StockOpnameExecution` | CRUD |
| `/v1/so-priority-rules` | `PriorityRules` | CRUD |
| `/v1/auctions` | `AuctionBatch` / `AuctionPickup` / `AuctionValidation` | CRUD |
| `/v1/reports` | `Report` | READ |

---

## Future Considerations

### Condition-Based Permissions (Multi-Tenant Scoping)

For proper multi-tenancy, permissions should include conditions:

```typescript
// Example: Admin PT should only access data in their company
{
  action: 'read',
  subject: 'Customer',
  condition: { companyId: '${user.companyId}' } // CASL template variable
}
```

This requires implementing the `parseCondition` method in `PermissionsGuard` to interpolate user context into permission conditions.

### Missing Subjects to Add

Based on feature specifications, consider adding:

- `Dashboard` - For dashboard access control
- `Notification` - For notification management
- `AuditLog` - For audit log access
- `Device` - For device management
- `PawnTerm` - For pawn term configuration

---

**Document Version:** 1.0  
**Maintained By:** Development Team  
**Reference:** Feature Specifications @ `feature_specifications/README.md`
