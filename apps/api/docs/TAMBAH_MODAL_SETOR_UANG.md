# Tambah Modal & Setor Uang — Implementation Guide

> **Last updated:** 2026-03-19  
> **Scope:** Backend (`apps/api`) + Frontend (`apps/web`)  
> **Payment Gateway:** Xendit Fixed Virtual Account

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Environment Setup](#3-environment-setup)
4. [Xendit Setup](#4-xendit-setup)
5. [Database Migration](#5-database-migration)
6. [API Reference](#6-api-reference)
7. [Frontend Pages](#7-frontend-pages)
8. [Cash Mutations — Auto-created Entries](#8-cash-mutations--auto-created-entries)
9. [Notifications](#9-notifications)
10. [Scheduler Jobs](#10-scheduler-jobs)
11. [Test Flow](#11-test-flow)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Feature Overview

### Tambah Modal (Capital Topup) — Pusat → Cabang

Staff Toko requests additional operating cash from head office. Admin PT reviews, approves, and manually transfers funds outside the system, then marks the request as **Selesai** (Disbursed). Upon disbursal, a Credit cash mutation is automatically recorded for the store.

**Key actors:**
| Actor | Action |
|-------|--------|
| Staff Toko | Creates request, views status |
| Admin PT | Approves / Rejects / Disburses |
| System | Auto-creates Credit mutation on disburse, sends notifications |

---

### Setor Uang (Cash Deposit) — Cabang → Pusat via Xendit VA

Admin PT creates a deposit request on behalf of a branch. Xendit generates a Fixed Virtual Account. Staff Toko transfers the exact amount to the VA. Xendit fires a webhook → status automatically becomes **Lunas** with no manual approval. Cash mutation is auto-recorded.

**Key actors:**
| Actor | Action |
|-------|--------|
| Admin PT | Creates deposit request (selects branch + nominal) |
| Xendit | Generates VA, fires webhook on payment |
| Staff Toko | Pays via bank transfer to VA number |
| System | Webhook auto-confirms, auto-creates Debit mutation, sends notifications |

---

## 2. Architecture & Data Flow

### Tambah Modal

```
[Staff Toko — Frontend]
  POST /api/v1/capital-topups
    └─> CapitalTopupService.create()
          └─> Save entity (status: pending)
          └─> NotificationService → Admin PT users

[Admin PT — Frontend]
  PUT /api/v1/capital-topups/:id/approve   → status: approved
  PUT /api/v1/capital-topups/:id/disburse  → status: disbursed
    └─> CapitalTopupService.disburse()
          └─> CashMutationService.createFromTopupDisbursement()
                └─> Credit mutation (store cash ↑)
          └─> NotificationService → Staff Toko
```

### Setor Uang

```
[Admin PT — Frontend]
  POST /api/v1/cash-deposits
    └─> CashDepositService.create()
          └─> Check: no existing pending for this branch
          └─> Calculate expiresAt = 23:59:59 WIB today
          └─> XenditService.createFixedVirtualAccount()
                └─> POST https://api.xendit.co/callback_virtual_accounts
          └─> Save entity (virtualAccount, xenditExternalId, expiresAt, status: pending)
          └─> NotificationService → Staff Toko

[Xendit — Payment Gateway]
  POST /api/v1/cash-deposits/webhook  (x-callback-token header)
    └─> CashDepositService.webhook()
          └─> Verify x-callback-token
          └─> Find deposit by xenditExternalId
          └─> Update status → lunas
          └─> CashMutationService.createFromDepositPayment()
                └─> Debit mutation (store cash ↓)
          └─> NotificationService → Staff Toko

[Scheduler — 00:01 WIB daily]
  SchedulerService.expirePendingDeposits()
    └─> UPDATE cash_deposits SET status='expired'
        WHERE status='pending' AND expires_at < NOW()
```

---

## 3. Environment Setup

Add to `apps/api/.env`:

```env
# Xendit
XENDIT_SECRET_KEY=xnd_development_YOUR_KEY_HERE
XENDIT_WEBHOOK_TOKEN=YOUR_WEBHOOK_TOKEN_HERE
XENDIT_VA_BANK_CODE=BNI         # optional, default: BNI
XENDIT_API_URL=https://api.xendit.co  # optional
```

**Getting these values from Xendit Dashboard:**
1. `XENDIT_SECRET_KEY` → **Settings → API Keys → Secret Keys** → copy the key
2. `XENDIT_WEBHOOK_TOKEN` → **Settings → Webhooks** → top of page, "Webhook Verification Token"

---

## 4. Xendit Setup

### Configure Webhook URL

In **Xendit Dashboard → Settings → Webhooks**:

| Section | Event | URL |
|---------|-------|-----|
| Virtual Account | Fixed Virtual Account Paid | `https://api.gadai-top.com/api/v1/cash-deposits/webhook` |

Enable **"Enable auto-retry for failed webhooks"** for reliability.

### Test Webhook

Use the **"Test and send"** button next to "Fixed Virtual Account Paid" in the Xendit dashboard. A test payload will be sent to your webhook URL. Expect `{ "received": true }` in the response.

### Sandbox vs Production

| Environment | Key prefix | API URL |
|-------------|-----------|---------|
| Sandbox | `xnd_development_` | `https://api.xendit.co` (same URL) |
| Production | `xnd_production_` | `https://api.xendit.co` |

Switch by replacing `XENDIT_SECRET_KEY` in `.env`.

---

## 5. Database Migration

The migration `1773902997251-NewMigration.ts` handles all schema changes for the `cash_deposits` table:

**Removed columns:**
- `payment_method` (enum)
- `payment_channel`
- `qr_code_url`
- `payment_proof_url`
- `approved_by`
- `approved_at`
- `rejection_reason`

**Added columns:**
- `xendit_external_id` (varchar 100, nullable)
- `expires_at` (timestamptz, nullable)

**Status enum changed:**
- Old: `pending | paid | confirmed | rejected | expired`
- New: `pending | lunas | expired`
- Existing data: `paid + confirmed → lunas`, `rejected → expired`

**Run migration:**
```bash
cd apps/api
pnpm migration:run
```

---

## 6. API Reference

### Capital Topup Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/capital-topups` | JWT | List (paginated) |
| `GET` | `/api/v1/capital-topups/:id` | JWT | Get one |
| `POST` | `/api/v1/capital-topups` | JWT | Create request |
| `PUT` | `/api/v1/capital-topups/:id` | JWT | Edit pending |
| `DELETE` | `/api/v1/capital-topups/:id` | JWT | Delete pending |
| `PUT` | `/api/v1/capital-topups/:id/approve` | JWT | Approve |
| `PUT` | `/api/v1/capital-topups/:id/reject` | JWT | Reject |
| `PUT` | `/api/v1/capital-topups/:id/disburse` | JWT | Disburse → auto-mutation |

### Cash Deposit Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/cash-deposits` | JWT | List (paginated) |
| `GET` | `/api/v1/cash-deposits/:id` | JWT | Get one |
| `POST` | `/api/v1/cash-deposits` | JWT | Create + generate VA |
| `POST` | `/api/v1/cash-deposits/webhook` | **Public** | Xendit callback |

---

## 7. Frontend Pages

### Tambah Modal (`/tambah-modal`)

| UI Element | Behavior |
|-----------|---------|
| "Request Tambah Modal" tab | Shows `pending` requests only |
| "History Tambah Modal" tab | Shows `approved`, `rejected`, `disbursed` |
| Status badges | Pending (gray) / Disetujui (green) / Selesai (blue) / Ditolak (red) |
| "Tambah Data" button | Visible to Staff Toko only |
| "Setujui" / "Tolak" actions | Visible to Admin PT on pending requests |
| "Selesai" on disburse | Maps `disbursed` API status → "Selesai" label in UI |

### Setor Uang (`/setor-uang`)

| UI Element | Behavior |
|-----------|---------|
| "Tambah Permintaan" button | Visible to **Admin PT only** |
| Status badges | Pending (yellow) / Lunas (green) / Expired (gray) |
| Detail dialog — Pending | Shows VA number + copy button + live expiry countdown |
| Detail dialog — Lunas | Shows VA number (for reference) |
| Detail dialog — Expired | Shows expired state only |
| "Refresh Status" button | Refetches the deposit from the API (for Staff Toko monitoring) |

---

## 8. Cash Mutations — Auto-created Entries

### On Tambah Modal Disburse

```
type:          credit
category:      topup
amount:        topup.amount
storeId:       topup.storeId
ptId:          topup.ptId
referenceId:   topup.uuid
referenceType: capital_topup
createdBy:     Admin PT UUID (disbursedBy)
```
Effect: **store cash balance increases** by the topup amount.

### On Setor Uang Payment (webhook)

```
type:          debit
category:      deposit
amount:        paid amount (from Xendit webhook)
storeId:       deposit.storeId
ptId:          deposit.ptId
referenceId:   deposit.uuid
referenceType: cash_deposit
createdBy:     deposit.requestedBy (Admin PT UUID)
```
Effect: **store cash balance decreases** by the deposit amount (cash leaving the store to HQ).

---

## 9. Notifications

### Tambah Modal

| Event | Recipient | Message |
|-------|-----------|---------|
| Request created | All `company_admin` of the PT | "Ada permintaan Tambah Modal baru dari [toko] sebesar Rp[X]" |
| Disbursed | Staff Toko (requester) | "Dana tambah modal sebesar Rp[X] telah dikirim" |

### Setor Uang

| Event | Recipient | Message |
|-------|-----------|---------|
| Deposit created | All `branch_staff` of the branch | "Admin PT membuat permintaan setor uang sebesar Rp[X]. Silakan transfer ke VA." |
| Webhook — Lunas | All `branch_staff` of the branch | "Pembayaran setor uang [code] telah dikonfirmasi. Status: Lunas." |

---

## 10. Scheduler Jobs

Located in `SchedulerService` (`src/modules/scheduler/scheduler.service.ts`):

| Cron | Job | Description |
|------|-----|-------------|
| `@Cron('1 0 * * *')` (00:01 daily) | `expirePendingDeposits()` | Bulk-expire pending deposits past their `expiresAt` |
| *(existing)* SPK overdue job | `handleOverdueSpk()` | Marks overdue SPKs |

---

## 11. Test Flow

### Test Accounts (Sandbox)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin PT | `admin.pt@gadaitop.com` | `password` | Can create Setor Uang, approve Tambah Modal |
| Staff Toko | `staff.toko@gadaitop.com` | `password` | Can create Tambah Modal, pays Setor Uang |

### Tambah Modal Test Flow

1. Login as **Staff Toko**
2. Go to **Tambah Modal** → "Tambah Data" → enter nominal → save
3. Login as **Admin PT**
4. Go to **Tambah Modal** → "Request Tambah Modal" tab → see pending request
5. Click **Setujui** → confirm dialog → request moves to Disetujui
6. Click **Disburse** (or via the detail action) → fill proof → confirm
7. Check **History** tab → status shows **"Selesai"** (blue badge)
8. Check **Mutasi Transaksi** → Credit entry for store exists

### Setor Uang Test Flow

1. Login as **Admin PT**
2. Go to **Setor Uang** → "Tambah Permintaan" → select branch + enter nominal → save
3. Note the **VA number** shown in the success dialog / detail view
4. Simulate Xendit webhook (use Xendit dashboard "Test and send", or `curl`):

```bash
curl -X POST https://api.gadai-top.com/api/v1/cash-deposits/webhook \
  -H "Content-Type: application/json" \
  -H "x-callback-token: YOUR_XENDIT_WEBHOOK_TOKEN" \
  -d '{
    "external_id": "DEP-20260319-12345",
    "amount": 5000000,
    "bank_code": "BNI",
    "account_number": "8808123456789",
    "status": "PAID"
  }'
```

5. Refresh the Setor Uang page → status changes to **Lunas** (green badge)
6. Login as **Staff Toko** → Setor Uang → detail dialog → status Lunas, notification received
7. Check **Mutasi Transaksi** → Debit entry for store exists

---

## 12. Troubleshooting

### Webhook returns 401 Unauthorized

`x-callback-token` header doesn't match `XENDIT_WEBHOOK_TOKEN` in `.env`.  
→ Copy the token exactly from Xendit Dashboard → Settings → Webhooks (top of page).

### Xendit VA creation fails

Check `XENDIT_SECRET_KEY` is set correctly (starts with `xnd_development_` for sandbox).  
Check bank code is valid — try `BNI` or `BRI`.  
Inspect NestJS logs for the raw Xendit error response.

### Status stays "pending" after payment

Webhook was not received (URL not reachable, wrong URL configured, or token mismatch).  
Use Xendit dashboard "Test and send" and inspect the response.  
Ensure the server is publicly accessible at `https://api.gadai-top.com`.

### "Sudah memiliki permintaan pending" error on create

A `pending` deposit already exists for that branch. Either wait for it to expire (end of day) or test after the nightly scheduler runs.

### Deposit not expiring

Scheduler runs at 00:01 WIB. Confirm `SchedulerModule` is imported in `AppModule` and `@nestjs/schedule` is enabled.  
Check server timezone or test manually:
```bash
# Via API console / ts-node
await cashDepositService.expirePendingDeposits()
```

---

## Related Documentation

- [`docs/modules/cash-deposit.md`](./modules/cash-deposit.md) — Setor Uang module reference
- [`docs/modules/capital-topup.md`](./modules/capital-topup.md) — Tambah Modal module reference
- [`docs/modules/xendit.md`](./modules/xendit.md) — Xendit service reference
- [`docs/modules/cash-mutation.md`](./modules/cash-mutation.md) — Cash mutation module
- [`docs/modules/notification.md`](./modules/notification.md) — Notification module
