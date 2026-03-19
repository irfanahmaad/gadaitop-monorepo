# SPK & NKB Gap Analysis and Implementation Plan

## Context

This document provides a comprehensive gap analysis between the SPK (Surat Perintah Kerja) and NKB (Nota Kredit Barang) user story requirements in `.docs/spk-and-nkb.md` and the existing implementation in the GadaiTop monorepo.

**Current State:** The system has a solid foundation with most core SPK/NKB functionality implemented. Main gaps are in specific business rules, customer portal features, and workflow refinements.

---

## Part 1: Gap Analysis by User Story

### User Story: SPK Baru (New SPK Creation)

| Requirement                                                   | Status         | Notes                                                |
| ------------------------------------------------------------- | -------------- | ---------------------------------------------------- |
| **Customer:** Customer comes to store with item and KTP       | ✅ Implemented | Customer management with KTP search exists           |
| **Staff searches customer by NIK/name**                       | ✅ Implemented | Auto-lookup on NIK input in create page              |
| **Create new customer if not exists**                         | ✅ Implemented | Customer can be created during SPK flow              |
| **Blacklist check - prevent SPK if blacklisted**              | ✅ Implemented | Blacklist validation in SPK creation                 |
| **Input item details: type, condition, completeness, status** | ✅ Implemented | Full item form with all fields                       |
| **IMEI scan or manual input**                                 | ✅ Implemented | IMEI field exists in item form                       |
| **Price reference from Master Katalog**                       | ✅ Implemented | Auto-filled from catalog with date reference         |
| **Loan amount ≤ catalog reference price**                     | ✅ Implemented | Validation exists                                    |
| **Customer-facing screen for PIN input**                      | ⚠️ Partial     | PIN input exists but not true "customer-facing" mode |
| **Use existing PIN or create new PIN option**                 | ❌ Missing     | No option shown - always uses existing PIN           |
| **Auto-generate Internal SPK Number: [Type][8-digit]**        | ✅ Implemented | Format: H00000001 with type code                     |
| **Auto-generate Customer SPK Number: [YYYYMMDD][4-random]**   | ✅ Implemented | Format: 202403191234                                 |
| **QR Code print - one-time only**                             | ⚠️ Partial     | QR generation exists, one-time print not enforced    |
| **Customer blacklist cannot proceed**                         | ✅ Implemented | Validation blocks creation                           |

### User Story: Melihat Daftar dan Riwayat SPK

| Requirement                                                               | Status         | Notes                           |
| ------------------------------------------------------------------------- | -------------- | ------------------------------- |
| **Index SPK - monitor all loans**                                         | ✅ Implemented | Full list page with filtering   |
| **Search by name, NIK, SPK number**                                       | ✅ Implemented | Search functionality exists     |
| **Filter by branch location**                                             | ✅ Implemented | Branch filtering exists         |
| **Show: item info, loan amount, catalog ref + date, NKB history, status** | ✅ Implemented | Detail page shows all info      |
| **SPK Status auto-update:**                                               |                |                                 |
| - "Berjalan" (Active)                                                     | ✅ Implemented | Status = Active                 |
| - "Terlambat" (Overdue)                                                   | ✅ Implemented | Status = Overdue                |
| - "Lunas" (Paid)                                                          | ⚠️ Partial     | Status = Redeemed (not "Lunas") |
| - "Terlelang" (Auctioned)                                                 | ✅ Implemented | Status = Auctioned              |

### User Story: NKB - Pelunasan oleh Customer (via Portal)

| Requirement                                                | Status         | Notes                                         |
| ---------------------------------------------------------- | -------------- | --------------------------------------------- |
| **Customer Portal login with NIK + PIN**                   | ✅ Implemented | Customer portal authentication exists         |
| **Show active SPK list with today's tagihan**              | ✅ Implemented | Portal shows SPK list                         |
| **Select SPK and choose "Pelunasan"**                      | ✅ Implemented | "Bayar Lunas" button exists                   |
| **Calculate total:**                                       |                |                                               |
| - < 15 days: Pokok + (Pokok × 5%)                          | ✅ Implemented | Early payment discount exists                 |
| - > 15 days, max 1 month: Pokok + (Pokok × 10%)            | ✅ Implemented | Normal interest rate applied                  |
| **Payment method selection:**                              |                |                                               |
| - Virtual Account / Payment Gateway                        | ⚠️ Partial     | Methods exist but no real gateway integration |
| - Cash at branch                                           | ✅ Implemented | Cash/transfer option exists                   |
| **Staff confirms cash payment**                            | ✅ Implemented | Staff confirmation flow exists                |
| **Create NKB number: [Location]-NKB-[YYYYMMDD]-[4Random]** | ✅ Implemented | Format matches                                |
| **Change SPK status to "Lunas"**                           | ⚠️ Partial     | Changes to "Redeemed" not "Lunas"             |
| **Record to mutasi toko**                                  | ✅ Implemented | Cash mutation integration exists              |

### User Story: NKB - Perpanjangan Tepat Waktu (via Portal)

| Requirement                                                      | Status         | Notes                                           |
| ---------------------------------------------------------------- | -------------- | ----------------------------------------------- |
| **Customer selects SPK before due date, chooses "Perpanjangan"** | ✅ Implemented | "Bayar Cicil" button exists                     |
| **Calculate:** (Pokok × 10%) + admin + insurance                 | ⚠️ Partial     | Interest + admin calculated, no insurance field |
| **Bunga calculated from pokok BEFORE partial payment**           | ✅ Implemented | Correct calculation order                       |
| **Customer inputs installment amount (min Rp50.000)**            | ✅ Implemented | Min validation exists                           |
| **Payment method: digital or cash**                              | ✅ Implemented | Both methods supported                          |
| **Reduce pokok balance**                                         | ✅ Implemented | remainingBalance updated                        |
| **Update due date: old due + 30 days**                           | ✅ Implemented | Correct calculation                             |
| **Create NKB number**                                            | ✅ Implemented | Auto-generated                                  |
| **SPK status remains "Berjalan"**                                | ⚠️ Partial     | Changes to "Extended" not "Berjalan"            |

### User Story: NKB - Perpanjangan Terlambat (via Portal)

| Requirement                                                                 | Status         | Notes                                          |
| --------------------------------------------------------------------------- | -------------- | ---------------------------------------------- |
| **Customer selects overdue SPK**                                            | ✅ Implemented | Overdue SPKs shown                             |
| **Calculate:** (Pokok × 10%) + admin + insurance + (2% × n months late)\*\* | ⚠️ Partial     | No insurance field, penalty calculation exists |
| **Denda × number of months late**                                           | ✅ Implemented | Per-month penalty calculation                  |
| **Next cycle bunga from pokok BEFORE today's payment**                      | ✅ Implemented | Correct calculation order                      |
| **Update due date: old due + 30 days**                                      | ✅ Implemented | Correct calculation                            |
| **Status returns to "Berjalan"**                                            | ⚠️ Partial     | Changes to "Extended" not "Berjalan"           |

### User Story: Staff Memproses Pembayaran via Scan SPK

| Requirement                                            | Status         | Notes                         |
| ------------------------------------------------------ | -------------- | ----------------------------- |
| **Staff scans QR Code on item**                        | ✅ Implemented | QR scanning exists            |
| **System shows: pokok, NKB history, due date, status** | ⚠️ Partial     | Scan leads to SPK detail page |
| **Staff asks customer: pelunasan or perpanjangan**     | ✅ Implemented | Both options available        |
| **Auto-calculate bunga and/or denda**                  | ✅ Implemented | Calculation API exists        |
| **Staff confirms payment**                             | ✅ Implemented | Confirmation flow exists      |
| **Create NKB, update SPK status, record to mutasi**    | ✅ Implemented | All integrations exist        |

---

## Part 2: Detailed Gap Summary

### Critical Gaps (Must Fix)

1. **Insurance Fee Field Missing**
   - Requirement: "(Pokok × 10%) + biaya administrasi + biaya asuransi"
   - Current: Only admin fee, no insurance fee field
   - Impact: Financial calculations incomplete
   - Location: SPK entity, NKB entity, payment calculations

2. **SPK Status Terminology Mismatch**
   - Requirement: "Berjalan", "Terlambat", "Lunas", "Terlelang"
   - Current: "Active", "Overdue", "Redeemed", "Auctioned", "Extended"
   - Impact: UI/UX inconsistency with requirements
   - Location: Frontend status labels, badges, translations

3. **One-Time QR Code Print Not Enforced**
   - Requirement: QR Code SPK can only be printed once
   - Current: QR generation exists, no print tracking
   - Impact: Security/audit concern
   - Location: SPK entity, print functionality

### Important Gaps (Should Fix)

4. **Customer-Facing Portal Mode**
   - Requirement: Separate customer-facing screen for PIN input
   - Current: PIN input in same screen, not truly "customer-facing"
   - Impact: UX not matching requirements
   - Location: SPK creation flow

5. **NKB Approval Workflow**
   - Requirement: Staff confirms cash payments
   - Current: Pending → Confirmed workflow exists
   - Impact: Minor - mostly implemented
   - Location: NKB list page

6. **Xendit Integration**
   - Status: Backend team is implementing locally - skipped to avoid conflicts

### Nice-to-Have Gaps

8. **SPK History Returns Empty**
   - Requirement: Show SPK history
   - Current: Endpoint exists but returns empty array
   - Location: `GET /spk/:id/history`

9. **SPK Edit Functionality**
   - No edit page for draft SPKs
   - Location: Frontend routing

10. **NKB Detail Page**
    - Only popup dialog, no dedicated page
    - Location: Frontend routing

---

## Part 3: Implementation Plan

### Phase 1: Critical Financial & Status Fixes (Priority 1)

#### 1.1 Add Insurance Fee to SPK and NKB

**Files to modify:**

- `apps/api/src/modules/spk/entities/spk-record.entity.ts`
- `apps/api/src/modules/nkb/entities/nkb-record.entity.ts`
- `apps/api/src/modules/spk/dto/*.dto.ts`
- `apps/api/src/modules/spk/spk-record.service.ts` (calculation logic)
- `apps/api/src/modules/nkb/nkb-record.service.ts` (calculation logic)
- `apps/web/lib/api/types.ts` (type definitions)
- Frontend forms to display insurance fee

**Changes:**

1. Add `insuranceFee` column to SPK entity (decimal, nullable)
2. Add `insuranceFee` column to NKB entity (decimal, nullable)
3. Create migration for new columns
4. Update payment calculation to include insurance fee
5. Update frontend to display insurance in breakdown

#### 1.2 Align SPK Status Terminology

**Files to modify:**

- `apps/api/src/modules/spk/enums/spk-status.enum.ts` (add display labels)
- Frontend status badge components and translations

**Changes:**

1. Add display name mapping to status enum
2. Update frontend to use display names: "Berjalan", "Terlambat", "Lunas", "Terlelang"
3. Keep internal enum values in English for code quality

### Phase 2: Customer Portal Enhancements (Priority 2)

#### 2.1 Customer-Facing PIN Input Mode

**Files to modify:**

- `apps/web/app/(dashboard)/spk/tambah/page.tsx`

**Changes:**

1. Add toggle for "Mode Layar Pelanggan"
2. When active, show simplified PIN input screen
3. Use larger fonts, clearer instructions
4. Full-screen or modal overlay for PIN input

### Phase 3: Security & Compliance (Priority 3)

#### 3.1 One-Time QR Code Print Tracking

**Files to modify:**

- `apps/api/src/modules/spk/entities/spk-record.entity.ts`
- `apps/api/src/modules/spk/entities/spk-item.entity.ts`
- `apps/web/app/(dashboard)/spk/[id]/page.tsx`

**Changes:**

1. Add `qrCodePrintedAt` timestamp column to SPK item entity
2. Add `qrCodePrintCount` column (default 0)
3. Update QR code generation endpoint to track prints
4. Block print after first successful print
5. Show "Sudah dicetak" status if printed
6. Add admin override for reprint (with reason)

### Phase 4: Nice-to-Have Features (Priority 4)

#### 4.1 Implement SPK History

**Files to modify:**

- `apps/api/src/modules/spk/spk-record.service.ts`
- Create audit/transaction log for SPK changes

#### 4.2 SPK Edit Page

**Files to create:**

- `apps/web/app/(dashboard)/spk/[id]/edit/page.tsx`

#### 4.3 NKB Detail Page

**Files to create:**

- `apps/web/app/(dashboard)/nkb/[id]/page.tsx`

---

## Part 4: Testing Strategy

### E2E Test Journeys to Create/Update

1. **SPK Creation Flow**
   - Create new customer during SPK
   - Blacklist validation
   - Item catalog reference
   - PIN input with new/existing option
   - QR code generation

2. **NKB Payment Flow**
   - Customer portal login
   - Calculate payment (early, normal, late)
   - Process payment
   - Status updates

3. **SPK Scan Flow**
   - QR code scan
   - Payment processing
   - Status updates

---

## Part 5: Critical Files Reference

### Backend Files

- `apps/api/src/modules/spk/` - SPK module
- `apps/api/src/modules/nkb/` - NKB module
- `apps/api/src/modules/customer/` - Customer module (PIN, blacklist)
- `apps/api/src/modules/catalog/` - Catalog module
- `apps/api/src/modules/branch/` - Branch module (location codes)
- `apps/api/src/modules/pawn-term/` - Pawn terms (interest, admin fee)
- `apps/api/src/modules/cash-mutation/` - Cash mutations

### Frontend Files

- `apps/web/app/(dashboard)/spk/` - SPK pages
- `apps/web/app/(dashboard)/nkb/` - NKB pages
- `apps/web/app/(customer-portal)/portal-customer/` - Customer portal
- `apps/web/lib/react-query/hooks/` - React Query hooks
- `apps/web/lib/api/` - API client and types

### Database

- `apps/api/src/database/migrations/` - Migration files
