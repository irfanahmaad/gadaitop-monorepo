# E2E Migration Matrix: Python → TypeScript Playwright

Scenario-by-scenario mapping from legacy Python suites to TypeScript spec files.

## Super Admin Suite

| Python Scenario | Target TS Spec | Notes |
|-----------------|---------------|-------|
| Login as Super Admin | auth.spec.ts | Already covered; super-admin uses storageState |
| Dashboard — wait for data to load | super-admin-dashboard.spec.ts | SPK Aktif metric, skeleton disappearance |
| Sidebar Navigation | super-admin-dashboard.spec.ts | Master Super Admin, Master PT, Master Tipe Barang links |
| Master Super Admin — list, search, detail, create form | super-admin-management.spec.ts | Table, search, row action Detail, Tambah Data → create page |
| Master PT — list, search, detail, create form | pt-management.spec.ts | Same pattern as super-admin |
| Master Tipe Barang — full CRUD | tipe-barang.spec.ts | Create dialog, Edit dialog, Delete with confirmation |

## SPK-NKB Suite

| Python Scenario | Target TS Spec | Actor | Notes |
|-----------------|---------------|-------|-------|
| Admin Login (Staff) | auth.spec.ts | — | Uses storageState; no separate login test needed |
| Admin Login (Company Admin) | auth.spec.ts | — | Same |
| SPK List Page | spk-flow.spec.ts | Staff Toko | Load, search, row count |
| SPK Creation | spk-flow.spec.ts | Staff Toko | Form fill, submit; needs SPK create helpers |
| SPK Detail View | spk-flow.spec.ts | Staff Toko | NKB history, status |
| SPK Status Badges | spk-flow.spec.ts | Staff Toko | Valid status values |
| Access Control — Staff | spk-flow.spec.ts | Staff Toko | Staff can access SPK list |
| Access Control — Admin | spk-flow.spec.ts | Admin PT | Branch filter visibility |
| NKB Admin Approval | nkb-flow.spec.ts | Staff Toko | Pending tab, NKB count, workflow accessible |
| Customer Login | customer-portal-spk.spec.ts | Customer | NIK + PIN; needs customer auth setup |
| Customer SPK List | customer-portal-spk.spec.ts | Customer | SPK count, status badges, pay button |
| NKB Pelunasan Flow | customer-portal-spk.spec.ts | Customer | Pay Full button, dialog open |
| Customer Payment Buttons | customer-portal-spk.spec.ts | Customer | Pay button visibility by status |

## New Coverage (Perpanjangan — not in Python)

| Scenario | Target TS Spec | Actor | Notes |
|----------|---------------|-------|-------|
| NKB Perpanjangan Tepat Waktu (On-time Extension) | nkb-flow.spec.ts | Customer | Extension before due date; needs seeded SPK in "berjalan" |
| NKB Perpanjangan Terlambat (Late Extension) | nkb-flow.spec.ts | Customer | Extension after due date; needs seeded SPK in "terlambat" |

## Target Spec Files Summary

- `super-admin-dashboard.spec.ts` — Dashboard + sidebar (Super Admin)
- `super-admin-management.spec.ts` — Master Super Admin CRUD (Super Admin)
- `pt-management.spec.ts` — Master PT CRUD (Super Admin)
- `tipe-barang.spec.ts` — Master Tipe Barang CRUD (Super Admin)
- `spk-flow.spec.ts` — SPK list, create, detail, access control (Staff, Admin PT)
- `customer-portal-spk.spec.ts` — Customer portal SPK list, pelunasan, payment buttons (Customer)
- `nkb-flow.spec.ts` — NKB admin approval, perpanjangan flows (Staff, Customer)
