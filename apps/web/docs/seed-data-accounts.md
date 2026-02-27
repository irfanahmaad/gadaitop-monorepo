# Seed Data & Test Accounts

This document lists all test accounts and seeded data for frontend integration and development.

**Last updated:** February 2026

---

## 1. Test Accounts

### Super Admin (Owner)

| Email | Password | Role | Company | Branch |
|-------|----------|------|---------|--------|
| admin@gadaitop.com | admin123 | owner (Pemilik / Super Admin) | PT001 (owner) | - |

### Company Owners

| Email | Password | Role | Company | Branch |
|-------|----------|------|---------|--------|
| admin@gadaitop.com | admin123 | owner | PT001 - PT Gadai Top Indonesia | - |
| owner.sejahtera@test.com | test123 | owner | PT002 - PT Gadai Sejahtera | - |
| owner.makmur@test.com | test123 | owner | PT003 - PT Gadai Makmur Jaya | - |

### PT001 - PT Gadai Top Indonesia

| Email | Password | Role | Branch |
|-------|----------|------|--------|
| admin.pt001@test.com | test123 | company_admin (Admin PT) | - |
| staff.jkt001@test.com | test123 | branch_staff (Staff Toko) | JKT001 - Jakarta Pusat |
| staff.bdg001@test.com | test123 | branch_staff | BDG001 - Bandung |
| staff.sby001@test.com | test123 | branch_staff | SBY001 - Surabaya |
| so.pt001@test.com | test123 | stock_auditor (Stock Opname) | JKT001 |
| lelang.pt001@test.com | test123 | auction_staff (Lelang) | - |
| marketing.pt001@test.com | test123 | marketing | - |

### PT002 - PT Gadai Sejahtera

| Email | Password | Role | Branch |
|-------|----------|------|--------|
| admin.pt002@test.com | test123 | company_admin | - |
| staff.jks001@test.com | test123 | branch_staff | JKS001 - Jakarta Selatan |
| staff.tng001@test.com | test123 | branch_staff | TNG001 - Tangerang |
| so.pt002@test.com | test123 | stock_auditor | JKS001 |
| lelang.pt002@test.com | test123 | auction_staff | - |
| marketing.pt002@test.com | test123 | marketing | - |

### PT003 - PT Gadai Makmur Jaya

| Email | Password | Role | Branch |
|-------|----------|------|--------|
| admin.pt003@test.com | test123 | company_admin | - |
| staff.bdg002@test.com | test123 | branch_staff | BDG002 - Bandung Timur |
| staff.crb001@test.com | test123 | branch_staff | CRB001 - Cirebon |
| so.pt003@test.com | test123 | stock_auditor | BDG002 |
| lelang.pt003@test.com | test123 | auction_staff | - |
| marketing.pt003@test.com | test123 | marketing | - |

---

## 2. Test Customer PIN

All seeded customers use the same PIN for portal access:

| PIN |
|-----|
| 123456 |

---

## 3. Role-to-Menu Mapping

Which sidebar menus each role can see:

| Role | Code | Dashboard | Menu Utama | Master Data |
|------|------|-----------|------------|-------------|
| Pemilik / Super Admin | owner | Yes | - | Master Super Admin, Master PT, Master Tipe Barang |
| Admin PT | company_admin | Yes | Scan KTP, SPK, Stock Opname, Lelangan, Tambah Modal, Setor Uang, Mutasi Transaksi, Laporan | Master Toko, Master Customer, Master Pengguna, Master Katalog, Master Syarat Mata |
| Staff Toko | branch_staff | No | Scan KTP, SPK, NKB, Stock Opname, Tambah Modal, Setor Uang, Mutasi Transaksi, Laporan | Master Customer |
| Stock Opname | stock_auditor | No | Stock Opname | - |
| Lelang | auction_staff | No | Lelangan | - |
| Marketing | marketing | No | Lelangan | - |

---

## 4. Seeded Data Summary

| Entity | Description | Count (approx) |
|--------|-------------|---------------|
| Roles | 6 system roles | 6 |
| Users | Super admin + company owners + test users per role | 25+ |
| Companies | PT001, PT002, PT003 | 3 |
| Branches | 7 branches across 3 companies | 7 |
| Item Types | Handphone, Laptop, Emas, Motor, Kendaraan, TV, Lainnya | 7 |
| Customers | Sample customers per company | 10 |
| Catalogs | Product catalog per company | 12 items × 3 companies |
| Pawn Terms | Lending terms per company × item type | 7 × 3 = 21 |
| SPKs | Pawn contracts (Active, Overdue, Draft, Redeemed, Closed); OverdueSpkSeed adds 2–4 overdue per PT if needed | ~49+ (7 per branch + supplemental overdue) |
| NKBs | Payment records (FullRedemption, Renewal, Rejected) | ~10+ |
| Stock Opname | Sessions (Completed, InProgress) per branch | ~14 |
| Auction Batches | Draft + ValidationPending per store | ~6 |
| Capital Topups | Pending, Approved, Disbursed, Rejected per branch | ~28 |
| Cash Deposits | Pending, Paid, Confirmed, Rejected per branch | ~28 |
| Cash Mutations | Running balance history per branch | ~49 |
| SO Priority Rules | ItemType, ValueThreshold, DaysOverdue, Custom per company | 12 |
| Notifications | Role-appropriate notifications per user | 2–3 per user |

---

## 5. Branches Reference

| Branch Code | Short Name | Company |
|-------------|------------|---------|
| JKT001 | Jakarta Pusat | PT001 |
| BDG001 | Bandung | PT001 |
| SBY001 | Surabaya | PT001 |
| JKS001 | Jakarta Selatan | PT002 |
| TNG001 | Tangerang | PT002 |
| BDG002 | Bandung Timur | PT003 |
| CRB001 | Cirebon | PT003 |

---

## 6. Running the Seed

From the monorepo root:

```bash
cd apps/api
pnpm run seed
```

Or via turbo:

```bash
pnpm exec turbo run seed --filter=api
```

---

## 7. Frontend Integration Notes

- **Login:** Use any account above. Super Admin sees platform-wide menus; others see company-scoped data.
- **PT scoping:** Admin PT, Staff, Stock Opname, Lelang, and Marketing users are scoped to their `companyId`. API responses filter by `userPtId`.
- **Lelangan > SPK Jatuh Tempo:** Admin PT (e.g. admin.pt001@test.com) sees overdue SPK items for their company. If the list is empty, run the API seed again: `cd apps/api && pnpm run seed`. The supplemental **OverdueSpkSeed** ensures each PT has at least 2 overdue SPKs with in_storage items.
- **Branch scoping:** Staff Toko and Stock Opname users are further scoped to their `branchId` where applicable.
- **Portal Customer:** Use customer NIK + PIN (123456) to test the customer portal flow.
