# Capital Topup Module (Tambah Modal)

## Overview

The Capital Topup module manages requests to increase a store's operational cash. Staff Toko submits a request, Admin PT reviews and approves, then manually transfers funds outside the system and marks the request as **Disbursed** — which automatically creates a Credit cash mutation for the store and notifies the requester.

## Flow

```
Staff Toko submits request (nominal)
  → Notification sent to Admin PT
    → Admin PT reviews and approves
      → Admin PT transfers funds (manual, outside system)
        → Admin PT marks as Disbursed
          → Credit mutation auto-created for store
            → Notification sent to Staff Toko: "Dana telah dikirim"
```

---

## Status Enum

| Value | Label (UI) | Meaning |
|-------|-----------|---------|
| `pending` | Pending | Request submitted, awaiting Admin PT review |
| `approved` | Disetujui | Approved by Admin PT, pending transfer |
| `rejected` | Ditolak | Rejected by Admin PT with reason |
| `disbursed` | Selesai | Funds transferred and confirmed |

> **UI Note:** `disbursed` displays as **"Selesai"** (not "Disetujui") in the History tab. The `approved` status means approved but not yet disbursed.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/capital-topups` | List requests (paginated) | JWT |
| GET | `/api/v1/capital-topups/:id` | Get request details | JWT |
| POST | `/api/v1/capital-topups` | Create topup request | JWT (Staff Toko) |
| PUT | `/api/v1/capital-topups/:id` | Edit pending request | JWT (Staff Toko) |
| DELETE | `/api/v1/capital-topups/:id` | Delete pending request | JWT |
| PUT | `/api/v1/capital-topups/:id/approve` | Approve request | JWT (Admin PT) |
| PUT | `/api/v1/capital-topups/:id/reject` | Reject with reason | JWT (Admin PT) |
| PUT | `/api/v1/capital-topups/:id/disburse` | Mark disbursed + auto-mutation | JWT (Admin PT) |

---

## Request & Response

### `POST /api/v1/capital-topups` — Create Request

**Request body:**
```json
{
  "storeId": "uuid-of-branch",
  "amount": 10000000,
  "notes": "Kebutuhan operasional mingguan"
}
```

**Response:**
```json
{
  "uuid": "...",
  "storeId": "...",
  "amount": 10000000,
  "status": "pending",
  "requestedBy": "...",
  "notes": "...",
  "store": { "..." },
  "createdBy": { "..." },
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Side effects on create:**
- Notification sent to all `company_admin` users of the PT: *"Ada permintaan Tambah Modal baru dari [toko]"*

---

### `PUT /api/v1/capital-topups/:id/disburse` — Disburse

**Request body:**
```json
{
  "proofUrl": "https://storage.../transfer-proof.jpg",
  "notes": "Transfer via BCA"
}
```

**Side effects on disburse:**
1. Status updated → `disbursed`
2. **Credit cash mutation** auto-created for the store (`category: topup`, `referenceType: capital_topup`)
3. Notification sent to requester (Staff Toko): *"Dana tambah modal telah dikirim"*

---

### `PUT /api/v1/capital-topups/:id/reject` — Reject

**Request body:**
```json
{
  "reason": "Nominal melebihi limit harian"
}
```

---

### `GET /api/v1/capital-topups` — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page (default: 1) |
| `pageSize` | number | Per page (default: 10) |
| `storeId` | uuid | Filter by branch |
| `ptId` | uuid | Filter by company |
| `status` | string | `pending` \| `approved` \| `rejected` \| `disbursed` |
| `dateFrom` | ISO date | Filter from date |
| `dateTo` | ISO date | Filter to date |

---

## Auto Cash Mutation on Disburse

When `disburse()` is called, `CashMutationService.createFromTopupDisbursement()` is invoked automatically:

```
type:          credit
category:      topup
amount:        topup.amount
storeId:       topup.storeId
ptId:          topup.ptId
referenceId:   topup.uuid
referenceType: capital_topup
createdBy:     disbursedBy (Admin PT UUID)
```

This increases the store's cash balance without any manual mutation entry needed.

---

## Notifications

| Trigger | Recipient | Message |
|---------|-----------|---------|
| Request created | All Admin PT of the company | "Ada permintaan Tambah Modal baru dari [toko]" |
| Disbursed | Staff Toko (requester) | "Dana tambah modal sebesar Rp[X] telah dikirim" |

---

## Required Permissions (CASL)

| Role | Action | Scope |
|------|--------|-------|
| `branch_staff` | CREATE, READ, UPDATE (pending only) | Own store |
| `company_admin` | READ, approve/reject/disburse | All stores under their PT |
| `owner` | READ | All |

---

## Related Modules

| Module | Relationship |
|--------|-------------|
| **CashMutationModule** | Auto-creates Credit mutation on `disburse` |
| **NotificationModule** | Notifies Admin PT on create; notifies Staff Toko on disburse |

---

## Feature Spec Reference

- [`store-staff-capital-topup.md`](../../feature_specifications/transactions/financial/store-staff-capital-topup.md)
