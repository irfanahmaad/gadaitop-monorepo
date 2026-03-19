# Cash Deposit Module (Setor Uang)

## Overview

The Cash Deposit module handles store cash deposits to head office via **Xendit Fixed Virtual Account (VA)**. Admin PT creates a deposit request for a specific branch, Xendit generates a VA number, Staff Toko transfers the exact amount to that VA, and Xendit's webhook automatically confirms the payment — setting the status to **Lunas** with no manual approval needed.

## Flow

```
Admin PT creates deposit (selects branch + nominal)
  → System generates Xendit Fixed VA (expires 23:59:59 WIB same day)
    → Notification sent to Staff Toko with VA number
      → Staff Toko transfers exact amount to VA
        → Xendit webhook fires → status = "lunas"
          → Cash Mutation auto-created (Debit store)
            → Notification sent to Staff Toko: "Lunas"
```

Pending deposits not paid by end of day are expired by a nightly scheduler cron.

---

## Status Enum

| Value | Label (UI) | Meaning |
|-------|-----------|---------|
| `pending` | Pending | VA generated, awaiting payment |
| `lunas` | Lunas | Payment confirmed by Xendit webhook |
| `expired` | Expired | Not paid before end of day (23:59:59 WIB) |

> **Note:** Previous statuses `paid`, `confirmed`, `rejected` were removed. There is no manual approval step — Xendit webhook auto-confirms.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/cash-deposits` | List deposits (paginated, filtered) | JWT |
| GET | `/api/v1/cash-deposits/:id` | Get single deposit details | JWT |
| POST | `/api/v1/cash-deposits` | Create deposit + generate VA | JWT (Admin PT only) |
| POST | `/api/v1/cash-deposits/webhook` | Xendit payment callback | **Public** (token verified) |

---

## Request & Response

### `POST /api/v1/cash-deposits` — Create Deposit

**Request body:**
```json
{
  "storeId": "uuid-of-branch",
  "ptId": "uuid-of-company",
  "amount": 5000000,
  "notes": "Setoran harian"
}
```
> `ptId` is optional — resolved from the branch record if omitted.

**Response:**
```json
{
  "uuid": "...",
  "depositCode": "DEP-20260319-12345",
  "storeId": "...",
  "ptId": "...",
  "amount": "5000000",
  "virtualAccount": "8808123456789",
  "xenditExternalId": "DEP-20260319-12345",
  "status": "pending",
  "expiresAt": "2026-03-19T16:59:59.000Z",
  "requestedBy": "...",
  "notes": "Setoran harian",
  "store": { "..." },
  "requester": { "..." },
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Business rules:**
- Only **one `pending` deposit per branch** at a time. Creating while another is pending returns `400`.
- `expiresAt` is always **23:59:59 WIB** (16:59:59 UTC) of the creation date.
- `depositCode` doubles as the Xendit `external_id` for webhook matching.

---

### `POST /api/v1/cash-deposits/webhook` — Xendit Callback

No JWT auth. Verified via `x-callback-token` header checked against `XENDIT_WEBHOOK_TOKEN` env var.

**Xendit sends this on VA payment:**
```json
{
  "external_id": "DEP-20260319-12345",
  "amount": 5000000,
  "bank_code": "BNI",
  "account_number": "8808123456789",
  "transaction_timestamp": "2026-03-19T10:30:00Z",
  "status": "PAID"
}
```

**Processing steps:**
1. Verify `x-callback-token` header → `401` if invalid
2. Match deposit by `xenditExternalId` = `external_id`
3. Skip if already `lunas` or `expired` (idempotent)
4. Update status → `lunas`
5. Auto-create Debit cash mutation for the store
6. Notify Staff Toko: "Setor uang berhasil dikonfirmasi — Lunas"
7. Return `{ "received": true }`

---

### `GET /api/v1/cash-deposits` — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page (default: 1) |
| `pageSize` | number | Per page (default: 10) |
| `storeId` | uuid | Filter by branch |
| `ptId` | uuid | Filter by company |
| `status` | string | `pending` \| `lunas` \| `expired` |
| `dateFrom` | ISO date | Filter from date |
| `dateTo` | ISO date | Filter to date |

---

## Entity Fields

| Column | Type | Description |
|--------|------|-------------|
| `deposit_code` | varchar | Unique code, e.g. `DEP-20260319-12345` |
| `store_id` | uuid | Branch FK |
| `pt_id` | uuid | Company FK |
| `amount` | decimal | Amount to deposit |
| `virtual_account` | varchar(50) | Xendit VA number shown to Staff Toko |
| `xendit_external_id` | varchar(100) | Xendit `external_id` for webhook matching |
| `status` | enum | `pending` / `lunas` / `expired` |
| `expires_at` | timestamptz | 23:59:59 WIB of creation day |
| `requested_by` | uuid | Admin PT user who created the deposit |
| `notes` | text | Optional notes |

---

## Nightly Expiry Scheduler

`SchedulerService` runs `@Cron('1 0 * * *')` (00:01 WIB daily):

```sql
UPDATE cash_deposits
SET status = 'expired'
WHERE status = 'pending'
AND expires_at < NOW()
```

This handles cases where Xendit does not fire a VA-expired callback.

---

## Required Permissions (CASL)

| Role | Action | Scope |
|------|--------|-------|
| `company_admin` | CREATE, READ | Own PT's deposits |
| `branch_staff` | READ | Own branch's deposits |
| `owner` | READ | All deposits |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `XENDIT_SECRET_KEY` | ✅ | API secret key (starts with `xnd_`) |
| `XENDIT_WEBHOOK_TOKEN` | ✅ | Callback verification token from Xendit dashboard |
| `XENDIT_API_URL` | ❌ | Override API base (default: `https://api.xendit.co`) |
| `XENDIT_VA_BANK_CODE` | ❌ | VA bank code (default: `BNI`) |

---

## Webhook URL (Staging)

```
https://api.gadai-top.com/api/v1/cash-deposits/webhook
```

Configure in: **Xendit Dashboard → Settings → Webhooks → Virtual Account → Fixed Virtual Account Paid**

---

## Related Modules

| Module | Relationship |
|--------|-------------|
| **XenditModule** | Creates Fixed VA, verifies webhook token |
| **CashMutationModule** | Auto-creates Debit mutation on `lunas` |
| **NotificationModule** | Notifies Staff Toko on create and on payment confirmation |
| **SchedulerModule** | Nightly job to expire unpaid pending deposits |

---

## Feature Spec Reference

- [`store-staff-cash-deposit.md`](../../feature_specifications/transactions/financial/store-staff-cash-deposit.md)
- [`admin-pt-cash-deposit.md`](../../feature_specifications/transactions/financial/admin-pt-cash-deposit.md)
