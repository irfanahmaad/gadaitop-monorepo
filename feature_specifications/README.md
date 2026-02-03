# Gadaitop CMS - Feature Specifications

**Project:** Gadaitop Pawn Shop Management System
**Version:** 1.0
**Last Updated:** 2026-01-18
**Total Features:** 258+ Feature Requirements (FR-001 to FR-258+)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Folder Structure](#folder-structure)
4. [Role-Permission Matrix](#role-permission-matrix)
5. [Feature Index by Domain](#feature-index-by-domain)
6. [Feature Index by FR Code](#feature-index-by-fr-code)
7. [Implementation Guide](#implementation-guide)
8. [Documentation](#documentation)

---

## Overview

Gadaitop is a comprehensive **pawn shop management system** supporting multi-tenant operations with:

- **7 User Roles:** Super Admin, Admin PT, Store Staff, Customer, Stock Opname Staff, Auction Staff, Marketing Staff
- **Core Modules:** SPK (Pawn Contracts), NKB (Payments), Inventory, Auctions, Financial Management
- **Multi-Tenancy:** PT (Company) → Stores (Branches) → Transactions
- **Customer Portal:** Self-service SPK viewing and payment

---

## Quick Start

### For Backend Developers

1. **Read the Database Schema**
   ```
   docs/database-schema-reference.md
   ```

2. **Review API Endpoints**
   ```
   docs/api-endpoint-mapping.md
   ```

3. **Understand Dependencies**
   ```
   docs/feature-dependency-map.md
   ```

4. **Implementation Order**
   - Phase 1: Auth + PT/Store + Users
   - Phase 2: Customers + Catalogs
   - Phase 3: SPK + NKB (Core transactions)
   - Phase 4-6: Financial, Inventory, Auction
   - Phase 7: Notifications + Optimization

### For Product Managers

1. **Browse Features by Domain**
   ```
   auth/           - Login and authentication
   dashboard/      - KPI dashboards
   transactions/   - SPK, NKB, Financial
   master-data/    - PT, Store, Customer, Catalog
   inventory/      - Stock opname
   auction/        - Auction management
   reports/        - Reports and notifications
   ```

2. **Review Role Permissions**
   - See [Role-Permission Matrix](#role-permission-matrix) below

---

## Folder Structure

### New Organization (Domain-Based)

```
feature_specifications/
├── README.md                          # This file - master index
├── docs/                              # Technical documentation
│   ├── api-endpoint-mapping.md        # Complete API reference
│   ├── database-schema-reference.md   # Database tables and relationships
│   ├── feature-dependency-map.md      # Implementation order and dependencies
│   └── role-permission-matrix.md      # Detailed RBAC matrix
│
├── auth/                              # Authentication features
│   ├── super-admin-login.md
│   ├── admin-pt-login.md
│   ├── store-staff-login.md
│   ├── customer-login.md
│   ├── stock-opname-staff-login.md
│   ├── auction-staff-login.md
│   └── marketing-staff-login.md
│
├── dashboard/                         # Dashboard features
│   ├── super-admin-dashboard.md
│   └── admin-pt-dashboard.md
│
├── transactions/                      # Transaction features
│   ├── spk/                          # SPK (Pawn Contracts)
│   │   ├── admin-pt-spk-management.md
│   │   ├── store-staff-spk-create.md
│   │   ├── customer-spk-list.md
│   │   └── customer-spk-detail.md
│   ├── nkb/                          # NKB (Payments)
│   │   └── store-staff-nkb-management.md
│   └── financial/                    # Financial transactions
│       ├── admin-pt-cash-deposit.md
│       ├── store-staff-cash-deposit.md
│       ├── admin-pt-capital-topup.md
│       ├── store-staff-capital-topup.md
│       ├── admin-pt-cash-mutations.md
│       └── store-staff-cash-mutations.md
│
├── master-data/                       # Master data management
│   ├── pt/                           # PT (Company) management
│   │   ├── pt-list.md
│   │   ├── pt-create.md
│   │   ├── pt-edit.md
│   │   └── pt-detail.md
│   ├── store/                        # Store/Branch management
│   │   └── admin-pt-store-management.md
│   ├── customer/                     # Customer management
│   │   ├── admin-pt-customer-management.md
│   │   ├── store-staff-customer-management.md
│   │   ├── store-staff-ktp-scan.md
│   │   └── customer-profile-view.md
│   ├── catalog/                      # Catalog management
│   │   └── admin-pt-catalog-management.md
│   ├── user/                         # User management
│   │   ├── admin-pt-user-management.md
│   │   ├── super-admin-list.md
│   │   ├── super-admin-create.md
│   │   ├── super-admin-detail.md
│   │   └── super-admin-edit.md
│   └── system/                       # System master data
│       ├── item-type-list.md
│       ├── item-type-management.md
│       └── admin-pt-pawn-terms.md
│
├── inventory/                         # Inventory management
│   ├── admin-pt-stock-opname-list.md
│   ├── admin-pt-stock-opname-detail.md
│   └── stock-opname-staff-counting.md
│
├── auction/                           # Auction management
│   ├── admin-pt-auction-management.md
│   ├── auction-staff-validation.md
│   └── marketing-staff-auction.md
│
├── reports/                           # Reports and notifications
│   ├── admin-pt-transaction-reports.md
│   ├── super-admin-notifications.md
│   ├── admin-pt-notifications.md
│   ├── customer-notifications.md
│   ├── store-staff-notifications.md
│   ├── stock-opname-staff-notifications.md
│   ├── auction-staff-notifications.md
│   └── marketing-staff-notifications.md
│
└── [Original folders preserved]      # Legacy role-based organization
    ├── Admin PT/
    ├── Customer/
    ├── Staf Lelang/
    ├── Staf Marketing/
    ├── Staf Stock Opname/
    ├── Staf Toko/
    └── Super Admin/
```

---

## Role-Permission Matrix

### Summary Table

| Feature Domain | Super Admin | Admin PT | Store Staff | Customer | SO Staff | Auction Staff | Marketing Staff |
|----------------|:-----------:|:--------:|:-----------:|:--------:|:--------:|:-------------:|:---------------:|
| **PT Management** | ✅ CRUD | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Store Management** | ❌ | ✅ CRUD | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ Super Admins | ✅ PT Users | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customer Management** | ❌ | ✅ View, Edit PIN | ✅ CRUD | 👁️ Own Profile | ❌ | ❌ | ❌ |
| **Catalog Management** | ❌ | ✅ CRUD | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Item Types** | ✅ CRUD | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **SPK (Pawn Contracts)** | ❌ | 👁️ View All | ✅ Create, View | 👁️ Own SPK | ❌ | ❌ | ❌ |
| **NKB (Payments)** | ❌ | 👁️ View All | ✅ Confirm/Reject | ✅ Initiate | ❌ | ❌ | ❌ |
| **Cash Deposits** | ❌ | ✅ Approve/Reject | ✅ Create | ❌ | ❌ | ❌ | ❌ |
| **Capital Top-up** | ❌ | ✅ Approve/Reject | ✅ Create | ❌ | ❌ | ❌ | ❌ |
| **Stock Opname** | ❌ | ✅ Schedule, Approve | ❌ | ❌ | ✅ Count, Record | ❌ | ❌ |
| **Auction Management** | ❌ | ✅ Create, Manage | ❌ | ❌ | ❌ | ✅ Validate | 👁️ View, Notes |
| **Reports** | ✅ Global | ✅ PT-scoped | 👁️ Own Store | ❌ | ❌ | ❌ | ❌ |
| **Notifications** | 👁️ View | 👁️ View | 👁️ View | 👁️ View | 👁️ View | 👁️ View | 👁️ View |

**Legend:**
- ✅ = Full CRUD access
- 👁️ = Read-only or limited access
- ❌ = No access

### Detailed Permissions

#### Super Admin
- **Scope:** Global (all PTs)
- **Capabilities:**
  - ✅ PT Management (CRUD)
  - ✅ Super Admin User Management (CRUD)
  - ✅ Item Types (CRUD)
  - ✅ Global Dashboard (view all PTs)
  - 👁️ Notifications (read-only)

#### Admin PT
- **Scope:** PT-level (single PT, all stores)
- **Capabilities:**
  - ✅ Store Management (CRUD)
  - ✅ User Management for PT (CRUD: Store Staff, SO Staff, Auction Staff, Marketing Staff)
  - ✅ Customer Management (view, edit contact, change PIN)
  - ✅ Catalog Management (CRUD)
  - ✅ Pawn Terms Configuration
  - 👁️ SPK (view all, filter, history)
  - 👁️ NKB (view all, history)
  - ✅ Cash Deposits (approve/reject)
  - ✅ Capital Top-up (approve/reject/disburse)
  - ✅ Stock Opname (schedule, approve)
  - ✅ Auction (create batches, manage items, update status)
  - ✅ Transaction Reports (generate, export)
  - ✅ PT Dashboard (KPIs, charts)
  - 👁️ Notifications

#### Store Staff
- **Scope:** Store-level (single store)
- **Capabilities:**
  - ✅ Customer Management (CRUD)
  - ✅ KTP Scanning (OCR integration)
  - ✅ SPK Creation (create, view)
  - ✅ NKB Management (confirm/reject payments)
  - ✅ Cash Deposits (create requests)
  - ✅ Capital Top-up (create, edit pending)
  - ✅ Cash Mutations (view, add manual)
  - 👁️ Notifications

#### Customer
- **Scope:** Self (own data only)
- **Capabilities:**
  - 👁️ Own Profile (view-only)
  - 👁️ Own SPK (list, view details)
  - ✅ Payments (initiate renewal/redemption, confirm with PIN)
  - 👁️ NKB History (view own payment records)
  - 👁️ Notifications

#### Stock Opname Staff
- **Scope:** Assigned SO sessions
- **Capabilities:**
  - ✅ Stock Opname Counting (count items, record condition, take photos)
  - ✅ QR Code Scanning (scan and print QR codes)
  - 👁️ Notifications

#### Auction Staff
- **Scope:** Assigned auction batches
- **Capabilities:**
  - ✅ Auction Item Validation (validate condition, update status)
  - ✅ QR Code Operations (scan and print)
  - ✅ Condition Recording (update item condition, add notes)
  - 👁️ Auction Batches (view assigned)
  - 👁️ Notifications

#### Marketing Staff
- **Scope:** Assigned auction batches
- **Capabilities:**
  - 👁️ Auction Batches (view-only)
  - ✅ Marketing Notes (add/edit notes on auction items)
  - ✅ Marketing Assets (upload photos, videos, documents)
  - 👁️ Notifications

---

## Feature Index by Domain

### Authentication (7 features)
| File | FR Codes | Description |
|------|----------|-------------|
| `auth/super-admin-login.md` | FR-076 to FR-080 | Super Admin login page |
| `auth/admin-pt-login.md` | FR-105 to FR-108 | Admin PT login page |
| `auth/store-staff-login.md` | FR-190 to FR-193 | Store Staff login page |
| `auth/customer-login.md` | FR-081 to FR-085 | Customer portal login (NIK/PIN) |
| `auth/stock-opname-staff-login.md` | Implied | SO Staff login page |
| `auth/auction-staff-login.md` | Implied | Auction Staff login page |
| `auth/marketing-staff-login.md` | Implied | Marketing Staff login page |

### Dashboard (2 features)
| File | FR Codes | Description |
|------|----------|-------------|
| `dashboard/super-admin-dashboard.md` | FR-069 to FR-075 | Global KPI dashboard |
| `dashboard/admin-pt-dashboard.md` | FR-109 to FR-115 | PT-scoped dashboard with filters |

### Transactions (10 features)
| File | FR Codes | Description |
|------|----------|-------------|
| `transactions/spk/admin-pt-spk-management.md` | FR-150 to FR-154 | SPK viewing and history |
| `transactions/spk/store-staff-spk-create.md` | FR-198 to FR-202 | Create new pawn contracts |
| `transactions/spk/customer-spk-list.md` | FR-086 to FR-097 | Customer SPK list view |
| `transactions/spk/customer-spk-detail.md` | FR-086 to FR-097 | Customer SPK detail and payment |
| `transactions/nkb/store-staff-nkb-management.md` | FR-203 to FR-207 | NKB confirmation and rejection |
| `transactions/financial/admin-pt-cash-deposit.md` | FR-140 to FR-144 | Cash deposit approval |
| `transactions/financial/store-staff-cash-deposit.md` | FR-213 to FR-216 | Cash deposit creation |
| `transactions/financial/admin-pt-capital-topup.md` | FR-134 to FR-139 | Capital top-up approval |
| `transactions/financial/store-staff-capital-topup.md` | FR-217 to FR-221 | Capital top-up request |
| `transactions/financial/*-cash-mutations.md` | FR-222 to FR-225 | Cash flow tracking |

### Master Data (18 features)
| File | FR Codes | Description |
|------|----------|-------------|
| `master-data/pt/pt-list.md` | FR-026 to FR-028 | PT list view |
| `master-data/pt/pt-create.md` | FR-029 to FR-034 | Create new PT |
| `master-data/pt/pt-edit.md` | FR-039 to FR-046 | Edit PT details |
| `master-data/pt/pt-detail.md` | FR-052 to FR-054 | View PT details |
| `master-data/store/admin-pt-store-management.md` | FR-165 to FR-169 | Store/branch CRUD |
| `master-data/customer/admin-pt-customer-management.md` | FR-160 to FR-164 | Customer viewing and PIN change |
| `master-data/customer/store-staff-customer-management.md` | FR-208 to FR-212 | Customer CRUD |
| `master-data/customer/store-staff-ktp-scan.md` | FR-194 to FR-197 | KTP OCR scanning |
| `master-data/customer/customer-profile-view.md` | FR-101 to FR-104 | Customer self-view profile |
| `master-data/catalog/admin-pt-catalog-management.md` | FR-176 to FR-180 | Catalog CRUD |
| `master-data/user/admin-pt-user-management.md` | FR-170 to FR-175 | PT user management |
| `master-data/user/super-admin-*.md` | FR-007 to FR-025 | Super Admin user management |
| `master-data/system/item-type-*.md` | FR-058 to FR-063 | Item type CRUD |
| `master-data/system/admin-pt-pawn-terms.md` | Implied | Pawn lending terms configuration |

### Inventory (3 features)
| File | FR Codes | Description |
|------|----------|-------------|
| `inventory/admin-pt-stock-opname-list.md` | FR-116 to FR-120 | SO session list and scheduling |
| `inventory/admin-pt-stock-opname-detail.md` | FR-121 to FR-126 | SO session detail and approval |
| `inventory/stock-opname-staff-counting.md` | FR-232 to FR-236 | Physical counting and condition recording |

### Auction (3 features)
| File | FR Codes | Description |
|------|----------|-------------|
| `auction/admin-pt-auction-management.md` | FR-127 to FR-133 | Auction batch creation and management |
| `auction/auction-staff-validation.md` | FR-243 to FR-247 | Item validation and QR operations |
| `auction/marketing-staff-auction.md` | FR-254 to FR-258 | Marketing notes and asset uploads |

### Reports & Notifications (9 features)
| File | FR Codes | Description |
|------|----------|-------------|
| `reports/admin-pt-transaction-reports.md` | FR-155 to FR-159 | Transaction reporting and exports |
| `reports/super-admin-notifications.md` | FR-064 to FR-068 | Super Admin notifications |
| `reports/admin-pt-notifications.md` | FR-186 to FR-189 | Admin PT notifications |
| `reports/customer-notifications.md` | FR-101 to FR-104 | Customer notifications |
| `reports/store-staff-notifications.md` | FR-226 to FR-228 | Store Staff notifications |
| `reports/stock-opname-staff-notifications.md` | Implied | SO Staff notifications |
| `reports/auction-staff-notifications.md` | Implied | Auction Staff notifications |
| `reports/marketing-staff-notifications.md` | Implied | Marketing Staff notifications |

---

## Feature Index by FR Code

### FR-001 to FR-025: Super Admin User Management
- `master-data/user/super-admin-list.md`
- `master-data/user/super-admin-create.md`
- `master-data/user/super-admin-detail.md`
- `master-data/user/super-admin-edit.md`

### FR-026 to FR-057: PT Management
- `master-data/pt/pt-list.md` (FR-026 to FR-028)
- `master-data/pt/pt-create.md` (FR-029 to FR-034)
- `master-data/pt/pt-edit.md` (FR-039 to FR-046)
- `master-data/pt/pt-detail.md` (FR-052 to FR-054)

### FR-058 to FR-063: Item Types
- `master-data/system/item-type-list.md`
- `master-data/system/item-type-management.md`

### FR-064 to FR-068: Super Admin Notifications
- `reports/super-admin-notifications.md`

### FR-069 to FR-075: Super Admin Dashboard
- `dashboard/super-admin-dashboard.md`

### FR-076 to FR-080: Super Admin Login
- `auth/super-admin-login.md`

### FR-081 to FR-104: Customer Portal
- `auth/customer-login.md` (FR-081 to FR-085)
- `transactions/spk/customer-spk-list.md` (FR-086 to FR-097)
- `transactions/spk/customer-spk-detail.md` (FR-086 to FR-097)
- `master-data/customer/customer-profile-view.md` (FR-098 to FR-100)
- `reports/customer-notifications.md` (FR-101 to FR-104)

### FR-105 to FR-189: Admin PT Features
- `auth/admin-pt-login.md` (FR-105 to FR-108)
- `dashboard/admin-pt-dashboard.md` (FR-109 to FR-115)
- `inventory/admin-pt-stock-opname-*.md` (FR-116 to FR-126)
- `auction/admin-pt-auction-management.md` (FR-127 to FR-133)
- `transactions/financial/admin-pt-capital-topup.md` (FR-134 to FR-139)
- `transactions/financial/admin-pt-cash-deposit.md` (FR-140 to FR-144)
- `transactions/spk/admin-pt-spk-management.md` (FR-150 to FR-154)
- `reports/admin-pt-transaction-reports.md` (FR-155 to FR-159)
- `master-data/customer/admin-pt-customer-management.md` (FR-160 to FR-164)
- `master-data/store/admin-pt-store-management.md` (FR-165 to FR-169)
- `master-data/user/admin-pt-user-management.md` (FR-170 to FR-175)
- `master-data/catalog/admin-pt-catalog-management.md` (FR-176 to FR-180)
- `reports/admin-pt-notifications.md` (FR-186 to FR-189)

### FR-190 to FR-228: Store Staff Features
- `auth/store-staff-login.md` (FR-190 to FR-193)
- `master-data/customer/store-staff-ktp-scan.md` (FR-194 to FR-197)
- `transactions/spk/store-staff-spk-create.md` (FR-198 to FR-202)
- `transactions/nkb/store-staff-nkb-management.md` (FR-203 to FR-207)
- `master-data/customer/store-staff-customer-management.md` (FR-208 to FR-212)
- `transactions/financial/store-staff-cash-deposit.md` (FR-213 to FR-216)
- `transactions/financial/store-staff-capital-topup.md` (FR-217 to FR-221)
- `transactions/financial/store-staff-cash-mutations.md` (FR-222 to FR-225)
- `reports/store-staff-notifications.md` (FR-226 to FR-228)

### FR-232 to FR-236: Stock Opname Staff
- `inventory/stock-opname-staff-counting.md`
- `reports/stock-opname-staff-notifications.md`

### FR-243 to FR-247: Auction Staff
- `auction/auction-staff-validation.md`
- `reports/auction-staff-notifications.md`

### FR-254 to FR-258: Marketing Staff
- `auction/marketing-staff-auction.md`
- `reports/marketing-staff-notifications.md`

---

## Implementation Guide

### Phase 1: Foundation (Week 1-2)
**Goal:** Authentication, multi-tenancy, basic master data

**Features to implement:**
1. Database schema (all tables)
2. Authentication system (all roles)
3. PT management (Super Admin)
4. Store management (Admin PT)
5. User management (Super Admin, Admin PT)
6. Item types (Super Admin)

**Deliverables:**
- All users can log in
- Super Admin can create PTs and Super Admins
- Admin PT can create stores and users
- Multi-tenant data scoping works

### Phase 2: Master Data (Week 3-4)
**Goal:** Customer and product data

**Features to implement:**
1. Customer management (Admin PT, Store Staff)
2. KTP OCR scanning (Store Staff)
3. Catalog management (Admin PT)
4. Pawn terms configuration (Admin PT)
5. Dashboards (Super Admin, Admin PT) - read-only

**Deliverables:**
- Store Staff can onboard customers
- Catalog is configured
- Dashboards show placeholder data

### Phase 3: Core Transactions (Week 5-7)
**Goal:** SPK and NKB workflows

**Features to implement:**
1. SPK creation (Store Staff)
2. Customer SPK portal (Customer)
3. NKB processing (Store Staff, Customer)
4. Payment gateway integration
5. Cash mutations (auto-generated)

**Deliverables:**
- End-to-end pawn workflow works
- Customers can view and pay SPK
- Staff can confirm payments
- Cash balance tracking works

### Phase 4: Financial (Week 8-9)
**Goal:** Cash management

**Features to implement:**
1. Cash deposits (Store Staff, Admin PT)
2. Capital top-up (Store Staff, Admin PT)
3. Cash mutations (manual entry)
4. Transaction reports (Admin PT)

**Deliverables:**
- Cash management workflow complete
- Financial reports exportable

### Phase 5: Inventory (Week 10-11)
**Goal:** Stock opname

**Features to implement:**
1. SO session management (Admin PT)
2. Physical counting (SO Staff)
3. QR code system

**Deliverables:**
- Stock opname workflow complete
- Item condition tracking works

### Phase 6: Auction (Week 12-14)
**Goal:** Auction system

**Features to implement:**
1. Auction batch management (Admin PT)
2. Item validation (Auction Staff)
3. Marketing support (Marketing Staff)

**Deliverables:**
- Auction workflow complete
- Marketing assets uploadable

### Phase 7: Polish (Week 15-16)
**Goal:** Notifications and optimization

**Features to implement:**
1. Real-time notifications (all roles)
2. Audit logging (all actions)
3. Performance optimization

**Deliverables:**
- Production-ready system

---

## Documentation

### For Developers

1. **[API Endpoint Mapping](docs/api-endpoint-mapping.md)**
   - Complete REST API reference
   - Request/response formats
   - Authentication headers
   - Error codes

2. **[Database Schema Reference](docs/database-schema-reference.md)**
   - All tables and columns
   - Relationships and foreign keys
   - Indexes and performance tips
   - Sample queries

3. **[Feature Dependency Map](docs/feature-dependency-map.md)**
   - Implementation order
   - Feature dependencies
   - Critical workflows
   - Data flow diagrams

### For Product/Business

1. **Feature Specifications** (organized by domain)
   - Browse `auth/`, `transactions/`, `master-data/`, etc.
   - Each file contains detailed acceptance criteria

2. **Role-Permission Matrix** (this document)
   - See above for detailed permissions

---

## Duplicate Files Identified

**⚠️ The following duplicate files were found and should be removed:**

1. **Super Admin Login:**
   - ❌ `Super Admin/SA01.1-Login Page.md` (duplicate of SA01)

2. **PT Edit:**
   - ❌ `Super Admin/SA02.2-Edit PT` (no .md extension, empty file)
   - ❌ `Super Admin/SA02.4-FR‑039 Open Edit PT Form.md` (duplicate of SA02.3)

3. **Super Admin Edit:**
   - ❌ `Super Admin/SA03.4-Edit Super Admin` (no .md extension, duplicate of SA03.3)

4. **Item Type Management:**
   - ⚠️ `Super Admin/SA04.1-Add, Edit, and Delete PopUp Tipe Barang` (missing .md extension)

---

## Naming Conventions

### Files
- **Format:** `{domain}-{entity}-{action}.md`
- **Style:** kebab-case
- **Examples:**
  - `admin-pt-customer-management.md`
  - `store-staff-spk-create.md`
  - `customer-spk-list.md`

### API Endpoints
- **Format:** `/api/{domain}/{entity}/{id?}/{action?}`
- **Style:** kebab-case
- **Examples:**
  - `/api/spk`
  - `/api/spk/123/confirm`
  - `/api/cash-deposits/456/approve`

### Database Tables
- **Format:** `{entity}s` or `{entity}_records`
- **Style:** snake_case, plural
- **Examples:**
  - `users`
  - `customers`
  - `spk_records`
  - `nkb_records`

---

## Contact & Support

For questions or clarifications:
- **Backend Team:** Review `docs/` folder first
- **Product Team:** Browse domain folders (`auth/`, `transactions/`, etc.)
- **Issues:** Check [Feature Dependency Map](docs/feature-dependency-map.md) for blockers

---

**Last Updated:** 2026-01-18
**Document Version:** 1.0
**Total Features:** 258+ FR codes across 7 user roles
