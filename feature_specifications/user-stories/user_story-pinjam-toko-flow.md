# Pinjam Toko (Pinjam PT) – User Story & Flow

This document describes the **Pinjam Toko** flow based on the requirement specification (US-4.5, US-4.6, US-4.7 in `user_stories-master-admin-pt-module.md`) and aligns it with the current implementation.

---

## 1. Specification Summary

| User Story | Title | Summary |
|------------|--------|---------|
| **US-4.5** | Request Pinjam PT | Pemilik creates a toko under another owner's PT; toko is marked "Pinjam PT" and stays pending until approved. |
| **US-4.6** | Approve/Reject Pinjam PT | PT owner approves or rejects incoming borrow requests; toko becomes active or inactive with rejection reason. |
| **US-4.7** | View Borrowed Branch Data | Pemilik sees all data of borrowed toko; PT being borrowed sees only basic info (kode, nama). |
| **US-4.8** | Revoke Pinjam PT (by Main PT) | PT owner (target company) can revoke an approved Pinjam PT toko; toko becomes inactive; requester notified. |

**Business rule:** *"Pada case pinjam PT, semua data pada toko tersebut hanya dapat dilihat oleh pemilik peminjam"* — only the actual owner (peminjam) sees full transactional data.

---

## 2. Complete User Flow (per specification)

### 2.1 Flow A: Requester (Pemilik A) – Create Toko under PT B (“Pinjam PT”)

1. **Navigate:** Master Toko → Tambah Data.
2. **Fill form:** Kode lokasi, nama toko (short/long), alamat, telepon, kota, **PT = B** (not own PT).
3. **Submit:** System treats this as Pinjam PT:
   - Branch created with: `companyId = B`, `isBorrowed = true`, `actualOwnerId = A’s user id`, `status = pending_approval`.
   - A **borrow_request** is created: `branchId`, `requesterId = A`, `targetCompanyId = B`, `status = pending`.
4. **Result:** New toko appears in Pemilik A’s list with status “pending_approval”; it is **not** operational until approved.
5. **Notification (spec):** Target PT owner (B) receives notification (AC-4.5.4).

### 2.2 Flow B: Target PT Owner (Pemilik B) – Approve or Reject

1. **Navigate:** Master Toko → tab **Request** (incoming requests for my PT).
2. **See:** List of pending requests: requester name, toko details, request date (AC-4.6.2).
3. **Approve:** Click “Setujui” → toko status → `active`, branch `isBorrowed = true`; requester gets notification (AC-4.6.3, AC-4.6.4).
4. **Reject:** Click “Tolak” → must enter rejection reason → toko status → `inactive`, `rejectionReason` saved; requester gets notification with reason (AC-4.6.5–4.6.7).
5. **Audit:** Any decision is recorded in audit log (AC-4.6.8).

### 2.3 Flow C: Requester (Pemilik A) – View and Use Borrowed Toko

1. **List:** Master Toko → tab **Toko Pinjaman** shows all branches where **actualOwnerId = A** (borrowed by A), regardless of `companyId`.
2. **Detail:** Click borrowed toko → full detail: SPK, NKB, mutasi, etc. (AC-4.7.2).
3. **Data access:** Only actualOwner (A) sees full transactional data (AC-4.7.4).

### 2.4 Flow D: Target PT Owner (Pemilik B) – View Borrowed-Out Toko

1. **View same toko (companyId = B, isBorrowed = true):** Pemilik B sees **only basic info** (kode lokasi, nama toko), **not** SPK/NKB/mutasi (AC-4.7.3).

### 2.5 List and Indicators (US-4.1)

- **Toko Utama:** Branches under my PT that are **not** borrowed (`companyId = my PT`, `isBorrowed = false`).
- **Toko Pinjaman:** Branches **I** borrowed (`actualOwnerId = my user id`); show indicator “Pinjam PT” (AC-4.1.5).
- **Request tab:**  
  - As **requester:** “My requests” (outgoing): `requesterId = me`.  
  - As **target owner:** “Incoming requests” (to approve): `targetCompanyId = my PT`, `status = pending`.

---

## 3. Data Model (per specification & DB)

### 3.1 Branch (Toko)

| Field | Purpose |
|-------|---------|
| `companyId` | PT the toko belongs to (structure). For Pinjam PT = target PT (B). |
| `isBorrowed` | `true` = borrowed toko. |
| `actualOwnerId` | User UUID of the actual owner (peminjam). |
| `status` | `draft` \| `pending_approval` \| `active` \| `inactive`. |
| `approvedBy` / `approvedAt` | Set when request is approved. |
| `rejectionReason` | Set when request is rejected. |

### 3.2 Borrow Request

| Field | Purpose |
|-------|---------|
| `branchId` | Branch (toko) being requested. |
| `requesterId` | User who requested (Pemilik A). |
| `targetCompanyId` | PT being borrowed from (B). |
| `status` | `pending` \| `approved` \| `rejected`. |
| `rejectionReason` | Required when rejecting. |

---

## 4. API Contract (per specification)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/borrow-requests` | List: as requester and/or as target (filter by `requesterId` or `targetCompanyId`). |
| POST | `/api/v1/borrow-requests` | Create borrow request (`branchId`, `targetCompanyId`, `requestReason?`). |
| PATCH | `/api/v1/borrow-requests/:id/approve` | Approve → branch `active`, `isBorrowed = true`. |
| PATCH | `/api/v1/borrow-requests/:id/reject` | Reject → branch `inactive`, set `rejectionReason`. |
| PATCH | `/api/v1/borrow-requests/:id/revoke` | Revoke (main PT only): end borrow → branch `inactive`; notify requester (US-4.8). |

**Branch create (Pinjam PT):**  
POST `/api/v1/branches` with `companyId = target PT`, `isBorrowed = true`, `actualOwnerId = requester user id` → branch in `pending_approval`. Then create a borrow_request for approval workflow.

---

## 5. Implementation vs Specification

### 5.1 Implemented

| Item | Status | Notes |
|------|--------|--------|
| Branch entity | ✅ | `isBorrowed`, `actualOwnerId`, `status`, `rejectionReason`, etc. |
| Branch create | ✅ | Accepts `isBorrowed`, `actualOwnerId`; sets `PendingApproval` when `isBorrowed`. |
| Borrow request entity & CRUD | ✅ | Create, approve, reject; branch status updated on approve/reject. |
| Master Toko tabs | ✅ | Toko Utama, Toko Pinjaman, Request. |
| Approve/Reject UI | ✅ | Setujui/Tolak with confirmation; reject reason in dialog. |
| Detail access control | ✅ | Non–actual-owner and non-company user sees “Anda tidak memiliki akses”. |
| “Pindah Toko” (existing branch) | ✅ | Detail page can create borrow request for existing branch. |

### 5.2 Gaps (to match specification)

| # | Requirement | Current state | Change needed |
|---|-------------|---------------|---------------|
| 1 | **US-4.5 – Create toko as Pinjam PT** | Tambah form only sends `companyId`; no `isBorrowed`/`actualOwnerId`, no borrow_request after create. | On “Tambah” when `companyId !== user.companyId`: (1) Send `isBorrowed: true`, `actualOwnerId: user.uuid` to POST branches. (2) After branch create, POST borrow-requests with `branchId`, `targetCompanyId: companyId`. |
| 2 | **US-4.7.1 – Toko Pinjaman list** | Branch list filtered only by `companyId = my PT`. Borrowed toko have `companyId = other PT`, so they don’t appear. | Backend: allow branch list by “actual owner” (e.g. `actualOwnerId=current user` or “include borrowed”). Frontend: Toko Pinjaman tab uses this (or separate endpoint) so Pemilik sees all branches they borrowed. |
| 3 | **US-4.6 – Request tab: incoming vs outgoing** | GET borrow-requests uses both `requesterId` and `targetCompanyId` from same user → only “I requested from my own PT”, so incoming list is wrong. | Backend: support two modes, e.g. filter by **either** `requesterId` (outgoing) **or** `targetCompanyId` (incoming). Frontend: Request tab shows “incoming” (targetCompanyId = my PT) for approval; optionally separate “My requests” (requesterId = me). |
| 4 | **AC-4.1.5 – “Pinjam PT” indicator** | List may not show “Pinjam PT” for borrowed branches. | Ensure list row or badge shows “Pinjam PT” when `isBorrowed === true` (and/or when branch is in Toko Pinjaman). |
| 5 | **AC-4.5.4, 4.6.4, 4.6.7 – Notifications** | Spec requires notifications for request created, approved, rejected. | Implement or wire notification when borrow_request is created, approved, or rejected. |
| 6 | **AC-4.6.8 – Audit log** | Spec requires audit log for approve/reject. | Ensure approve/reject (and optionally create) write to audit log. |
| 7 | **US-4.7.3 – Target owner sees only basic info** | Detail page blocks access if `branch.companyId !== user.companyId` for non–actual-owner. | For target owner (companyId = branch.companyId but not actualOwner): allow read-only view with only kode lokasi, nama toko (no SPK/NKB/mutasi). |

---

## 6. Recommended Implementation Order

1. **Backend – Branch list for “Toko Pinjaman”**  
   Add filter (e.g. `actualOwnerId` or `includeBorrowedByMe`) so branches where `actualOwnerId = current user` are returned (or merge with companyId list).
2. **Backend – Borrow-requests list**  
   Support “incoming” (targetCompanyId only) and “outgoing” (requesterId only) so Request tab can show correct lists.
3. **Frontend – Tambah: Pinjam PT**  
   When PT ≠ my PT: send `isBorrowed`, `actualOwnerId`, then create borrow_request after branch create.
4. **Frontend – Request tab**  
   Use “incoming” filter for current user’s PT so target owner sees requests to approve; optionally second list for “My requests”.
5. **Frontend – “Pinjam PT” indicator**  
   Show badge/label in Master Toko list for borrowed branches.
6. **Detail – Target owner limited view**  
   For user with `companyId = branch.companyId` and not actualOwner: show only kode + nama (no transactional data).
7. **Notifications & audit**  
   Add notifications and audit log entries per AC-4.5.4, 4.6.4, 4.6.7, 4.6.8.

---

## 7. Acceptance Criteria Checklist (from spec)

- [ ] **AC-4.5.1** – Create toko form: selecting different PT marks as “Pinjam PT”.
- [ ] **AC-4.5.2** – Pinjam PT submit → toko created with status `pending_approval`.
- [ ] **AC-4.5.3** – Pending toko not operational until approved.
- [ ] **AC-4.5.4** – Target PT owner receives notification.
- [ ] **AC-4.5.5** – Pinjam PT toko: `isBorrowed = true`, `actualOwnerId = my user id`.
- [ ] **AC-4.5.6** – Pending toko visible in my toko list (with correct list API).
- [ ] **AC-4.6.1** – PT owner sees notification when someone requests Pinjam PT.
- [ ] **AC-4.6.2** – Approval page shows requester name, toko details, request date.
- [ ] **AC-4.6.3** – “Setujui” → toko status `active`.
- [ ] **AC-4.6.4** – Requester receives notification on approve.
- [ ] **AC-4.6.5** – “Tolak” requires rejection reason.
- [ ] **AC-4.6.6** – Reject → toko `inactive`, `rejectionReason` saved.
- [ ] **AC-4.6.7** – Requester receives notification with reason on reject.
- [ ] **AC-4.6.8** – Audit log records approve/reject.
- [ ] **AC-4.7.1** – My borrowed toko visible in list (Toko Pinjaman).
- [ ] **AC-4.7.2** – Borrowed toko detail shows all SPK, NKB, mutasi (for actualOwner).
- [ ] **AC-4.7.3** – Target PT owner sees only basic info (kode, nama).
- [ ] **AC-4.7.4** – Only actualOwner sees full transactional data.
- [ ] **AC-4.8.1** – Main PT can trigger Revoke on approved borrowed toko (Toko Utama or list of borrowed-by-others).
- [ ] **AC-4.8.2** – Revoke → toko inactive; requester notified.
- [ ] **AC-4.8.3** – Revoked toko no longer operational for borrower; target PT keeps limited view.
- [ ] **AC-4.8.4** – Revoke recorded in audit log.

---

*Source: `user_stories-master-admin-pt-module.md` (US-4.5, US-4.6, US-4.7), `database-schema-reference.md` (branches, borrow_requests).*
