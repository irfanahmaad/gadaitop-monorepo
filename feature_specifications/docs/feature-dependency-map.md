# Feature Dependency Map - Gadaitop CMS

**Version:** 1.0
**Last Updated:** 2026-01-18
**Purpose:** Document feature dependencies and implementation order for backend development

---

## Table of Contents

1. [Implementation Phases](#implementation-phases)
2. [Core Dependencies](#core-dependencies)
3. [Feature Dependency Graph](#feature-dependency-graph)
4. [Critical Workflows](#critical-workflows)
5. [Implementation Order](#implementation-order)

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Priority:** Critical
**Dependencies:** None

| Feature Domain | Files | FR Codes | Description |
|----------------|-------|----------|-------------|
| **Database Schema** | `docs/database-schema-reference.md` | All | Create all database tables, relationships, indexes |
| **Authentication** | `auth/*-login.md` | FR-076 to FR-193 | Implement JWT auth, role-based access control |
| **Organization Setup** | `master-data/pt/*.md` | FR-026 to FR-057 | PT and Store management (required for all other features) |
| **User Management** | `master-data/user/*.md` | FR-001 to FR-025, FR-170 to FR-175 | User CRUD, roles assignment |
| **System Master Data** | `master-data/system/*.md` | FR-058 to FR-063 | Item types (foundation for catalogs and items) |

**Deliverables:**
- Working database with all tables
- Login/logout for all user roles
- PT and Store CRUD operations
- User management system
- Item type management

---

### Phase 2: Master Data & Configuration (Week 3-4)
**Priority:** High
**Dependencies:** Phase 1 (PT, Stores, Auth)

| Feature Domain | Files | FR Codes | Description |
|----------------|-------|----------|-------------|
| **Customer Management** | `master-data/customer/*.md` | FR-160 to FR-164, FR-208 to FR-212 | Customer CRUD, KTP OCR integration |
| **Catalog Management** | `master-data/catalog/*.md` | FR-176 to FR-180 | Product/catalog setup for pawn items |
| **Pawn Terms** | `master-data/system/admin-pt-pawn-terms.md` | Implied | Interest rates, loan limits configuration |
| **Dashboards** | `dashboard/*.md` | FR-069 to FR-115 | Dashboard KPIs and charts (read-only, no dependencies) |

**Deliverables:**
- Customer onboarding with KTP scanning
- Catalog and pawn terms configuration
- PT and Super Admin dashboards

---

### Phase 3: Core Transactions (Week 5-7)
**Priority:** Critical
**Dependencies:** Phase 2 (Customers, Catalogs)

| Feature Domain | Files | FR Codes | Description |
|----------------|-------|----------|-------------|
| **SPK Creation** | `transactions/spk/store-staff-spk-create.md` | FR-198 to FR-202 | Create pawn contracts (requires Customers + Items) |
| **SPK Management** | `transactions/spk/admin-pt-spk-management.md` | FR-150 to FR-154 | SPK listing, filtering, viewing |
| **Customer SPK Portal** | `transactions/spk/customer-*.md` | FR-086 to FR-097 | Customer self-service (view SPK, payments) |
| **NKB Processing** | `transactions/nkb/*.md` | FR-152 to FR-154, FR-203 to FR-207 | Payment/renewal processing |

**Deliverables:**
- End-to-end SPK creation workflow
- Customer can view and pay SPK
- NKB confirmation and rejection by staff
- Payment gateway integration

**Critical Workflow:**
```
Customer Onboarding → SPK Creation → Customer Confirmation → NKB Payment → Staff Approval
```

---

### Phase 4: Financial Management (Week 8-9)
**Priority:** High
**Dependencies:** Phase 3 (SPK, NKB)

| Feature Domain | Files | FR Codes | Description |
|----------------|-------|----------|-------------|
| **Cash Deposits** | `transactions/financial/*-cash-deposit.md` | FR-140 to FR-144, FR-213 to FR-216 | Store cash deposits with approval |
| **Capital Top-up** | `transactions/financial/*-capital-topup.md` | FR-134 to FR-139, FR-217 to FR-221 | Store capital requests and approval |
| **Cash Mutations** | `transactions/financial/*-cash-mutations.md` | FR-222 to FR-225 | Cash flow tracking and reconciliation |
| **Transaction Reports** | `reports/admin-pt-transaction-reports.md` | FR-155 to FR-159 | Financial reporting and exports |

**Deliverables:**
- Store cash management system
- Capital approval workflow
- Cash mutation tracking
- Financial reports (CSV, PDF, Excel exports)

---

### Phase 5: Inventory & Stock Opname (Week 10-11)
**Priority:** Medium
**Dependencies:** Phase 3 (SPK Items)

| Feature Domain | Files | FR Codes | Description |
|----------------|-------|----------|-------------|
| **Stock Opname Sessions** | `inventory/admin-pt-stock-opname-*.md` | FR-116 to FR-126 | Create and manage SO sessions |
| **Stock Counting** | `inventory/stock-opname-staff-counting.md` | FR-232 to FR-236 | Physical item counting and condition recording |
| **QR Code System** | Integrated in SO | FR-234 to FR-235 | QR code generation and scanning |

**Deliverables:**
- Stock opname scheduling
- Item counting with variance detection
- Condition tracking with photos
- QR code-based item tracking

---

### Phase 6: Auction System (Week 12-14)
**Priority:** Medium
**Dependencies:** Phase 5 (Stock Opname, SPK Items)

| Feature Domain | Files | FR Codes | Description |
|----------------|-------|----------|-------------|
| **Auction Management** | `auction/admin-pt-auction-management.md` | FR-127 to FR-133 | Create auction batches, manage items |
| **Auction Validation** | `auction/auction-staff-validation.md` | FR-243 to FR-247 | Item validation and QR scanning |
| **Marketing Support** | `auction/marketing-staff-auction.md` | FR-254 to FR-258 | Marketing notes and asset uploads |

**Deliverables:**
- Auction batch creation and scheduling
- Item validation workflow
- Marketing asset management
- Auction status tracking

---

### Phase 7: Notifications & Finalization (Week 15-16)
**Priority:** Low
**Dependencies:** All previous phases

| Feature Domain | Files | FR Codes | Description |
|----------------|-------|----------|-------------|
| **Notifications** | `reports/*-notifications.md` | FR-064 to FR-068, FR-186 to FR-189, etc. | Push notifications for all events |
| **Audit Logging** | Backend implementation | All | Complete audit trail |
| **Performance Optimization** | N/A | N/A | Indexing, caching, query optimization |

**Deliverables:**
- Real-time notifications for all user actions
- Comprehensive audit logging
- Performance optimization
- Final testing and bug fixes

---

## Core Dependencies

### Authentication Dependencies
```
Auth System
├─ Required by: ALL features
└─ Provides: User sessions, role verification, permissions
```

### Organization Dependencies
```
PTs (Companies)
├─ Required by: Stores, Users, Customers, SPK, Reports
├─ Provides: Multi-tenancy scoping
└─ Must exist before: ANY data entry

Stores (Branches)
├─ Required by: SPK, NKB, Cash operations, Stock Opname
├─ Depends on: PTs
└─ Provides: Store-level scoping
```

### Master Data Dependencies
```
Item Types
├─ Required by: Catalogs, SPK Items
└─ Provides: Item categorization

Customers
├─ Required by: SPK creation
├─ Depends on: PTs (indirect via stores)
└─ Provides: Customer identity for loans

Catalogs
├─ Required by: SPK creation (optional, can be manual)
├─ Depends on: Item Types, PTs
└─ Provides: Standard item pricing
```

### Transaction Dependencies
```
SPK Records
├─ Required by: NKB, Auctions, Stock Opname
├─ Depends on: Customers, Stores, PTs
└─ Provides: Loan contracts

SPK Items
├─ Required by: Stock Opname, Auctions
├─ Depends on: SPK Records, Item Types
└─ Provides: Physical items to track

NKB Records
├─ Required by: Financial reports
├─ Depends on: SPK Records
└─ Provides: Payment history
```

---

## Feature Dependency Graph

```
┌──────────────────────────────────────────────────────┐
│  PHASE 1: FOUNDATION                                 │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐         │
│  │   Auth   │  │  PTs     │  │ Item Types │         │
│  └────┬─────┘  └────┬─────┘  └──────┬─────┘         │
│       │             │               │                │
└───────┼─────────────┼───────────────┼────────────────┘
        │             │               │
        ▼             ▼               ▼
┌──────────────────────────────────────────────────────┐
│  PHASE 2: MASTER DATA                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Stores   │  │Customers │  │ Catalogs │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │             │              │                 │
└───────┼─────────────┼──────────────┼─────────────────┘
        │             │              │
        └──────┬──────┴──────────────┘
               ▼
┌──────────────────────────────────────────────────────┐
│  PHASE 3: CORE TRANSACTIONS                          │
│  ┌──────────┐  ┌──────────┐                          │
│  │   SPK    │─▶│  Items   │                          │
│  └────┬─────┘  └────┬─────┘                          │
│       │             │                                 │
│       ▼             │                                 │
│  ┌──────────┐      │                                 │
│  │   NKB    │      │                                 │
│  └────┬─────┘      │                                 │
│       │            │                                 │
└───────┼────────────┼─────────────────────────────────┘
        │            │
        ▼            ▼
┌──────────────────────────────────────────────────────┐
│  PHASE 4: FINANCIAL                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐       │
│  │ Cash Deps  │  │  Capital   │  │ Mutations│       │
│  └────────────┘  └────────────┘  └──────────┘       │
└──────────────────────────────────────────────────────┘
        │            │
        │            ▼
        │     ┌──────────────────────┐
        │     │  PHASE 5: INVENTORY  │
        │     │  ┌────────────────┐  │
        │     │  │ Stock Opname   │  │
        │     │  └────────┬───────┘  │
        │     └───────────┼──────────┘
        │                 │
        │                 ▼
        │     ┌──────────────────────┐
        │     │  PHASE 6: AUCTION    │
        │     │  ┌────────────────┐  │
        │     │  │ Auction Batch  │  │
        │     │  └────────┬───────┘  │
        │     └───────────┼──────────┘
        │                 │
        └─────────────────┼───────────┐
                          │           │
                          ▼           ▼
┌──────────────────────────────────────────────────────┐
│  PHASE 7: NOTIFICATIONS & AUDIT                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │Notifications │  │  Audit Logs  │                 │
│  └──────────────┘  └──────────────┘                 │
└──────────────────────────────────────────────────────┘
```

---

## Critical Workflows

### Workflow 1: SPK Creation & Payment
**Dependencies:** Auth → PT → Store → Customer → SPK → NKB

```
1. Store Staff Login (auth/store-staff-login.md)
   └─ Requires: users table, authentication system

2. Customer Lookup/Creation (master-data/customer/*.md)
   ├─ Requires: customers table, PT/Store association
   └─ Optional: KTP OCR integration

3. SPK Creation (transactions/spk/store-staff-spk-create.md)
   ├─ Requires: SPK table, Items table, Catalog (optional)
   ├─ Triggers: Cash mutation (debit), Notification to customer
   └─ Outputs: SPK Number, QR Code

4. Customer PIN Confirmation (transactions/spk/customer-spk-detail.md)
   ├─ Requires: Customer portal auth, PIN verification
   └─ Updates: SPK status to 'active'

5. Payment/Renewal (transactions/spk/customer-spk-list.md)
   ├─ Requires: Payment gateway integration, NKB table
   ├─ Creates: NKB record (status: pending)
   └─ Triggers: Notification to Store Staff

6. NKB Confirmation (transactions/nkb/store-staff-nkb-management.md)
   ├─ Requires: Store Staff auth, NKB table
   ├─ Updates: NKB status, SPK balance, SPK status
   ├─ Triggers: Cash mutation (credit), Customer notification
   └─ Outputs: Payment receipt
```

### Workflow 2: Stock Opname → Auction
**Dependencies:** SPK → Items → Stock Opname → Auction

```
1. Schedule SO Session (inventory/admin-pt-stock-opname-list.md)
   ├─ Requires: Admin PT auth, SO sessions table
   └─ Assigns: SO Staff to session

2. Physical Counting (inventory/stock-opname-staff-counting.md)
   ├─ Requires: SO Staff auth, SO items table, QR scanning
   ├─ Records: Counted quantities, condition changes, photos
   └─ Calculates: Variances

3. SO Approval (inventory/admin-pt-stock-opname-detail.md)
   ├─ Requires: Admin PT auth
   ├─ Updates: Item conditions in spk_items
   └─ Identifies: Items for auction (overdue, damaged)

4. Create Auction Batch (auction/admin-pt-auction-management.md)
   ├─ Requires: Admin PT auth, Auction batches table
   ├─ Filters: Items marked for auction
   └─ Assigns: Auction Staff, Marketing Staff

5. Item Validation (auction/auction-staff-validation.md)
   ├─ Requires: Auction Staff auth
   ├─ Updates: Item status to 'ready' or 'not_prepared'
   └─ Triggers: Notification to Marketing

6. Marketing Preparation (auction/marketing-staff-auction.md)
   ├─ Requires: Marketing Staff auth
   ├─ Uploads: Photos, videos, documents
   └─ Updates: Marketing notes

7. Auction Execution
   ├─ Updates: Item status, final prices
   └─ Triggers: SPK closure, NKB final settlement
```

### Workflow 3: Cash Management
**Dependencies:** Store → Cash Mutations → Approvals

```
1. Store Cash Deposit Request (transactions/financial/store-staff-cash-deposit.md)
   ├─ Requires: Store Staff auth, Cash deposits table
   ├─ Generates: QR code or Virtual Account
   └─ Triggers: Notification to Admin PT

2. Payment Confirmation
   ├─ External: Payment gateway callback
   ├─ Updates: Deposit status to 'paid'
   └─ Triggers: Notification to Store Staff + Admin PT

3. Admin PT Approval (transactions/financial/admin-pt-cash-deposit.md)
   ├─ Requires: Admin PT auth
   ├─ Updates: Deposit status to 'confirmed'
   ├─ Creates: Cash mutation (credit to store balance)
   └─ Triggers: Notification to Store Staff

4. Store Balance Update
   ├─ Updates: stores.cash_balance
   └─ Records: Audit log entry
```

---

## Implementation Order

### Must Implement First
1. **Database Schema** - All tables, relationships, indexes
2. **Authentication** - JWT auth, session management, RBAC
3. **PT & Store Management** - Multi-tenancy foundation
4. **User Management** - User CRUD, role assignment
5. **Item Types** - System master data

### Can Implement in Parallel (After Phase 1)
- **Customer Management** + **Catalog Management**
- **Dashboard** (read-only, low priority)
- **Notifications** (can be stubbed initially)

### Must Implement Sequentially
```
Customer → SPK → NKB → Financial Reports
SPK Items → Stock Opname → Auction
```

### Can Defer to Later
- Marketing asset uploads (auction phase)
- Advanced reporting and analytics
- Notification delivery (can use logging initially)
- Performance optimization (after core features work)

---

## Data Flow Dependencies

### SPK Data Flow
```
Customer Data → SPK Record → SPK Items → Stock Opname → Auction Items
                    ↓
                NKB Records → Cash Mutations → Financial Reports
```

### Financial Data Flow
```
SPK Disbursement → Cash Mutation (Debit)
NKB Payment → Cash Mutation (Credit)
Cash Deposit → Cash Mutation (Credit)
Capital Topup → Cash Mutation (Credit)
Store Balance = SUM(Cash Mutations)
```

### Notification Dependencies
```
SPK Created → Customer Notification
NKB Pending → Store Staff Notification
NKB Confirmed → Customer Notification
Cash Deposit Paid → Admin PT Notification
SO Completed → Admin PT Notification
Auction Item Ready → Marketing Staff Notification
```

---

## Testing Dependencies

### Unit Testing Order
1. Models & Migrations (database layer)
2. Authentication services
3. Individual CRUD operations
4. Business logic (interest calculation, balance updates)

### Integration Testing Order
1. Auth flow (login → session → permissions)
2. SPK creation flow (customer → SPK → items)
3. NKB flow (payment → confirmation → balance update)
4. Cash management flow (deposit → approval → balance)
5. SO → Auction flow

### End-to-End Testing
1. Complete pawn journey (customer onboarding → SPK → payment → redemption)
2. Complete auction journey (overdue SPK → SO → auction → sale)
3. Complete cash cycle (deposit → SPK disbursement → NKB collection → balance)

---

## Critical Blockers

### Without Authentication
- ❌ Cannot implement ANY feature
- ❌ No role-based access control
- ❌ No audit logging

### Without PT/Store Setup
- ❌ Cannot create customers (need PT association)
- ❌ Cannot create SPK (need store assignment)
- ❌ Cannot scope data correctly

### Without Customers
- ❌ Cannot create SPK
- ❌ Cannot test customer portal

### Without SPK
- ❌ Cannot test NKB
- ❌ Cannot test Stock Opname
- ❌ Cannot test Auctions
- ❌ Cannot test Financial Reports

### Without Item Types
- ❌ Cannot create catalogs
- ❌ Cannot categorize SPK items
- ❌ Cannot configure pawn terms

---

## API Call Dependencies

### SPK Creation Endpoint Chain
```
POST /api/customers (if new)
  ↓
POST /api/spk
  ├─ validates customer exists
  ├─ validates store exists
  ├─ validates catalog (if used)
  └─ creates SPK + Items atomically
       ↓
POST /api/cash-mutations (auto-generated)
  └─ updates store balance
       ↓
POST /api/notifications (auto-generated)
  └─ notifies customer of new SPK
```

### NKB Confirmation Chain
```
PUT /api/nkb/{id}/confirm
  ├─ validates NKB exists and is pending
  ├─ updates NKB status to 'confirmed'
  ├─ updates SPK remaining_balance
  ├─ updates SPK status (if fully paid)
  ├─ creates cash mutation (credit)
  ├─ updates store balance
  └─ creates customer notification
```

---

**End of Feature Dependency Map**
