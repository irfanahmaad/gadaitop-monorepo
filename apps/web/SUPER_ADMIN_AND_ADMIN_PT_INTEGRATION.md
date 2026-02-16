# Super Admin & Admin PT Integration – Backend Features Left

This document summarizes the **current integration** between the web app and the backend for **Super Admin (owner)** and **Admin PT (company_admin)** roles, and lists **features / gaps left for the backend** to complete.

**Audience:** Backend team  
**Last updated:** February 2026

---

## Status overview – Done ✅ vs Left ❌

| # | Feature | Done | Left |
|---|---------|:----:|:----:|
| 1 | **Auth / session** | | |
| | Login returns `companyId`, `roles`, `ownedCompanyId` | ✅ | |
| | Refresh token (AC-1.5.1) | | ❌ |
| | Account lock after N failed attempts (AC-1.1.3–1.1.4) | | ❌ |
| | Inactive/suspended check on login (AC-1.1.5) | | ❌ |
| 2 | **List endpoints – PT scoping** | | |
| | Branches list scoped by `userCompanyId` | ✅ | |
| | SPK list scoped by `userPtId` | ✅ | |
| | NKB list scoped by `userPtId` | ✅ | |
| | Dashboard KPIs/charts use `ptId` / user context | ✅ | |
| | Reports (mutation, SPK, NKB, stock opname) use `userPtId` | ✅ | |
| | Customers list scoped by `userPtId` | ✅ | |
| | Catalogs list scoped by `userPtId` | ✅ | |
| | Pawn terms list scoped by `userPtId` | ✅ | |
| | Cash deposits list scoped by `userPtId` | ✅ | |
| | Capital topups list scoped by `userPtId` | ✅ | |
| | Stock opname sessions list scoped by `userPtId` | ✅ | |
| | Auction batches list scoped by `userPtId` | ✅ | |
| 3 | **Users (Master Pengguna)** | | |
| | Users list scoped by company for company_admin | | ❌ |
| | User create: enforce `companyId` = requester’s company for company_admin | | ❌ |
| | Create user: validate branch belongs to company | | ❌ |
| 4 | **Resource-level auth (findOne / update / delete)** | | |
| | Branch findOne/update/delete – ensure branch belongs to requester’s PT | | ❌ |
| | Customer findOne/update/delete – PT check | | ❌ |
| | Catalog findOne/update/delete – PT check | | ❌ |
| | Pawn term findOne/update/delete – PT check | | ❌ |
| | SPK findOne/update/delete – PT check | | ❌ |
| | NKB findOne/update/delete – PT check | | ❌ |
| | Cash deposit findOne/approve/reject – PT check | | ❌ |
| | Capital topup findOne/approve/reject – PT check | | ❌ |
| | Stock opname findOne/complete/approve – PT check | | ❌ |
| | Auction batch findOne/update – PT check | | ❌ |
| 5 | **Cash mutations** | | |
| | Mutations list uses storeId / user context | ✅ | |
| | Validate `storeId` belongs to requester’s PT for company_admin | | ❌ |
| 6 | **Devices** | | |
| | Device CRUD endpoints exist | ✅ | |
| | Scope by company: company_admin only for users in their PT | | ❌ |
| | MAC/device check at login (if required by spec) | | ❌ |
| 7 | **Audit logs** | | |
| | Audit list/export exist | ✅ | |
| | Scope by PT for company_admin (and rule for owner) | | ❌ |
| 8 | **Companies** | | |
| | Companies list returns all (used only by Super Admin in UI) | ✅ | |
| | Restrict company_admin to single company (optional) | | ❌ |
| 9 | **Notifications** | | |
| | Notifications scoped by recipient (user UUID) | ✅ | |
| | PT-level filtering for Admin PT (if in spec) | | ❌ |

**Legend:** ✅ = implemented (backend done), ❌ = not implemented (left for backend).

---

## 1. Current Integration Summary

### 1.1 Role Identification

| Role            | Backend code        | Frontend detection                                      |
|-----------------|---------------------|---------------------------------------------------------|
| Super Admin     | `owner`             | `user?.roles?.some((r) => r.code === "owner")`         |
| Admin PT        | `company_admin`     | `user?.roles?.some((r) => r.code === "company_admin")`  |

Session (from `POST /v1/auth/login`) must include:

- `user.roles[]` with `code` (e.g. `"owner"`, `"company_admin"`)
- **Admin PT only:** `user.companyId` (UUID of the PT the admin belongs to)
- **Super Admin / Owner:** `user.ownedCompanyId` may be set for the PT they “own”; `companyId` is typically null

Frontend uses `companyId` for Admin PT and optional `selectedPT` (from dropdown) for Super Admin to scope data.

### 1.2 Menu Visibility (Sidebar)

Defined in `apps/web/lib/casl/ability.ts`:

- **Super Admin (owner):** Dashboard, Master Super Admin, Master PT, Master Tipe Barang.
- **Admin PT (company_admin):** Dashboard, SPK, Stock Opname, Lelangan, Tambah Modal, Setor Uang, Mutasi Transaksi, Laporan, Master Toko, Master Customer, Master Pengguna, Master Katalog, Master Syarat Mata.  
  (No “Scan KTP” – by design.)

### 1.3 Pages Using Super Admin / Admin PT Logic

All of these use `isSuperAdmin` and/or `isCompanyAdmin` and PT/branch filters:

| Page / Route              | Super Admin behaviour              | Admin PT behaviour                          |
|---------------------------|------------------------------------|---------------------------------------------|
| `/` (Dashboard)           | PT + Toko filters; KPIs by PT     | Single PT from `user.companyId`; Toko filter |
| `/spk`                    | PT filter (optional)               | Scoped by `companyId`                        |
| `/setor-uang`             | PT + branch filters                | Branch filter (branches of their PT)        |
| `/tambah-modal`           | PT + branch filters                | Branch filter                               |
| `/mutasi-transaksi`       | PT + branch filters                | Branch filter                               |
| `/laporan`                | PT filter for reports              | Reports for their PT                        |
| `/master-toko`           | PT filter; list branches by PT     | Branches of their PT                        |
| `/master-customer`       | PT filter                          | Customers of their PT                       |
| `/master-pengguna`       | PT filter                          | Users of their PT (filtered client-side)    |
| `/master-katalog`        | PT filter                          | Catalogs of their PT                        |
| `/master-syarat-mata`    | PT filter                          | Pawn terms of their PT                      |
| `/lelangan`               | PT filter                          | Auction data of their PT                    |
| `/stock-opname`           | —                                  | company_admin sees list/calendar (no create)|

Super Admin–only pages:

- `/super-admin` (list), `/super-admin/create`, `/super-admin/[slug]`, `/super-admin/[slug]/edit` (Master Super Admin CRUD)
- `/pt` (Master PT list/create/detail/edit)

Frontend expects:

- **Super Admin:** Can call `GET /companies` (list all PTs) and pass `ptId` / `companyId` in list/report APIs.
- **Admin PT:** Never calls `GET /companies` for dropdown; uses `user.companyId` and expects all list/report APIs to be scoped to that PT when no `ptId` is sent (or when backend uses request user’s `companyId`).

---

## 2. Backend Features / Gaps Left

### 2.1 User (Master Pengguna) – List & Create Scoping

**Current:**

- `GET /v1/users` uses `QueryUserDto` with optional `roleCode`; **no `companyId`** and **no request-user context**.
- Frontend (Master Pengguna) filters users **client-side** by `companyFilterId` for Admin PT.
- `POST /v1/users` (CreateUserDto) accepts optional `companyId`; backend does **not** enforce that the requester (e.g. company_admin) can only create users for their own company.

**Backend work left:**

1. **User list scoping (Admin PT):**
   - When the requester has role `company_admin`, enforce that `GET /v1/users` only returns users whose `companyId` equals the requester’s `companyId`.
   - Option A: Add optional `companyId` to `QueryUserDto` and, for company_admin, ignore/override it with `req.user.companyId`.
   - Option B: In controller, pass `req.user` into user service and apply company filter in service when user is company_admin.

2. **User create (Admin PT):**
   - When the requester is company_admin, enforce that:
     - Either `companyId` is not sent and backend sets it to `req.user.companyId`, or
     - `companyId` must equal `req.user.companyId`.
   - Reject with 403 if company_admin sends a different `companyId`.

---

### 2.2 Resource-Level Authorization (findOne / update / delete)

**Current:**

- Many list endpoints correctly scope by `user.companyId` or `user.ownedCompanyId` (and optional query `ptId` for Super Admin).
- **findOne / update / delete** often do **not** check that the resource belongs to the requester’s PT.

**Backend work left:**

1. **Branch:**
   - For `GET /v1/branches/:id`, `PATCH /v1/branches/:id`, `DELETE /v1/branches/:id`: when the user is company_admin, ensure the branch’s `companyId` equals `req.user.companyId`; otherwise return 404 (or 403).

2. **Customer, Catalog, Pawn Term, SPK, NKB, Cash Deposit, Capital Topup, Stock Opname, Auction, etc.:**
   - For each resource that is PT-scoped (has `ptId` or equivalent), ensure that **findOne**, **update**, and **delete**:
     - Resolve the resource’s PT (e.g. via branch or direct ptId).
     - For company_admin: require that resource’s PT = `req.user.companyId`.
     - For owner: allow if they have access (e.g. any PT they can manage, or explicit check).
   - Return 404 (or 403) when the resource does not belong to the requester’s scope.

---

### 2.3 Cash Mutations – Store Scoping for Admin PT

**Current:**

- `GET /v1/cash-mutations` and balance use `storeId` from query or `user.branchId`.
- Backend does **not** validate that `storeId` (branch) belongs to the requester’s PT.

**Backend work left:**

- When requester is **company_admin** (no branchId), either:
  - Ignore `storeId` from query and return mutations for **all branches** of `req.user.companyId`, or
  - Accept `storeId` but **validate** that the branch’s `companyId` = `req.user.companyId`; otherwise return 403 or empty.
- Do not allow company_admin to pass an arbitrary `storeId` of another PT.

---

### 2.4 Companies List – Optional Restriction for Admin PT

**Current:**

- `GET /v1/companies` returns all companies; frontend only calls it when `isSuperAdmin`, so Admin PT does not see the list in the current UI.

**Backend work left (optional, defense in depth):**

- If Admin PT ever calls `GET /v1/companies`, consider restricting the response to a single company (the one in `req.user.companyId`) so they cannot list other PTs.

---

### 2.5 Device Registration (User Stories)

**Current:**

- Endpoints exist: `GET/POST/PATCH/DELETE /v1/users/:userId/devices`.
- **No company/user scoping:** any authenticated user can list or manage devices for **any** `userId`.

**Backend work left:**

1. **Authorization:**
   - **Super Admin:** Can list/register/update/delete devices for any user (or at least for users they are allowed to manage).
   - **Admin PT:** Only for users where `user.companyId === req.user.companyId`.
   - Otherwise return 403.

2. **MAC / device checks at login (if required by product):**
   - If login must be restricted to registered devices (e.g. AC-1.2.x, AC-1.3.x), backend must validate device (e.g. MAC) at login and reject when not registered or inactive.

---

### 2.6 Audit Logs

**Current:**

- `GET /v1/audit-logs` and export do not receive `req.user`; no PT or user scoping.

**Backend work left:**

- **Admin PT:** Restrict audit logs to actions within their PT (e.g. by resource PT or actor’s companyId).
- **Super Admin:** May see all or only their owned PT(s) depending on product; define and implement scope.

---

### 2.7 Notifications

**Current:**

- Notifications are scoped by `recipientId` (logged-in user’s UUID). No PT-level filtering in the backend.

**Backend work left (if required by spec):**

- Ensure notifications for Admin PT are only created for events within their PT and that listing already filters by recipient; if spec requires “only events relevant to Admin PT’s PT”, implement that in notification creation and/or listing.

---

### 2.8 Authentication & Session (From User Stories)

**Current:**

- Login returns JWT and user with `companyId`, `roles`, etc.
- No refresh token flow mentioned in auth flow; frontend re-login on access token expiry.

**Backend work left (if required):**

- **Refresh token (AC-1.5.1):** If product requires refresh token, implement issue/rotate/revoke and document for frontend.
- **Account lock (AC-1.1.3, AC-1.1.4):** Implement lock after N failed attempts and unlock after X minutes; return appropriate message on login.
- **Inactive/suspended (AC-1.1.5):** Ensure login checks `activeStatus` and returns clear error.

---

### 2.9 Create User – Branch Assignment

**Current:**

- CreateUserDto has optional `companyId` and `branchId`.
- Frontend (Master Pengguna) for Admin PT: branch assignment optional; user can access all toko under the PT (AC-5.2.1, AC-5.2.5).

**Backend work left:**

- Enforce business rules: e.g. when role is company_admin, `branchId` optional and user is allowed to access all branches under their `companyId`; when role is branch_staff, `branchId` may be required and must belong to `companyId`. Validate branch belongs to company when provided.

---

## 3. Summary Checklist for Backend

| # | Area                         | Task                                                                 | Done | Left | Priority |
|---|------------------------------|----------------------------------------------------------------------|:----:|:----:|----------|
| 1 | Users list                   | Scope `GET /users` by company when requester is company_admin        | | ❌ | High     |
| 2 | User create                 | Restrict company_admin to `companyId = req.user.companyId`           | | ❌ | High     |
| 3 | Branch findOne/update/delete| Ensure branch belongs to company_admin’s company                     | | ❌ | High     |
| 4 | Other resources             | Add PT-ownership check for findOne/update/delete (customer, catalog, SPK, NKB, deposits, topups, stock opname, auction, etc.) | | ❌ | High |
| 5 | Cash mutations              | Validate storeId belongs to requester’s PT for company_admin        | | ❌ | Medium   |
| 6 | Devices                     | Scope by user’s company (company_admin only own PT users)             | | ❌ | Medium   |
| 7 | Audit logs                  | Scope by PT for company_admin (and define rule for owner)            | | ❌ | Medium   |
| 8 | Companies list              | Optionally restrict company_admin to single company                   | | ❌ | Low      |
| 9 | Notifications               | Align with “only events for Admin PT’s PT” if in spec               | | ❌ | Low      |
| 10| Auth                        | Refresh token, lock after failed attempts, inactive/suspended check  | | ❌ | Per spec |

---

## 4. Frontend Assumptions (Contract for Backend)

- **Login response** includes `user.companyId`, `user.roles[].code`, and (for owner) optionally `user.ownedCompanyId`.
- **List endpoints** that support `ptId`/`companyId` in query use **request user’s companyId** when the caller is company_admin and does not send (or must not override with) another PT.
- **Branches:** `GET /v1/branches?companyId=...` is used; for company_admin, frontend passes `user.companyId`; backend already scopes by `userCompanyId` in controller.
- **Reports/Dashboard:** Frontend sends `ptId` for Super Admin; for Admin PT sends no `ptId` and expects backend to use `req.user.companyId`.
- **Master Pengguna:** Frontend filters users client-side by company; backend should add server-side scoping so Admin PT never receives users from other PTs.

This document should be updated as backend completes each item so that frontend and backend stay aligned.
