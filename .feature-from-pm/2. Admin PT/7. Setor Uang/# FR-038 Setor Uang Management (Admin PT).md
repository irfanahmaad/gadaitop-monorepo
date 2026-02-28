# FR-038 Setor Uang Management (Admin PT)

## Feature Name
Setor Uang – Central Branch Fund Deposit Requests

## Description
The **Setor Uang** page allows Admin PT (central) to manage fund deposit requests from branches (stores). Admin creates requests with nominal amount and generates unique **Virtual Account (VA)** numbers. Branches pay via VA same-day; payment gateway callbacks auto-update status to **Lunas** and post to mutations (central Credit, branch Debit). Status flow: **Pending** → **Lunas** or **Expired**. Read-only list with create, detail, and monitoring.

## Actor
- Admin PT (central)

## Priority
High

---

## Preconditions

1. Admin PT logged in with **Setor Uang** access.
2. Stores (branches) exist under PT.
3. Payment gateway integrated for VA + callbacks.

---

## Postconditions

1. New requests generated with unique VA.
2. Callbacks update status/mutations automatically.
3. Expired requests archived.

---

## FR‑038.1 View Setor Uang Request List

### Description
Paginated, filterable table of deposit requests with status monitoring.

### UI & Interaction Requirements

#### Page Header
- Title: **"Setor Uang"**.
- Breadcrumb: `Pages / Setor Uang`.
- Top-right: **"+ Buat Permintaan Setoran"** → create form (FR‑038.2).

#### Search & Filter
- Search: **"Cari berdasarkan toko, VA, atau nominal"**.
- **Filter** panel:
  - **Tanggal Mulai** | **Sampai Dengan** – date.
  - **Toko** – multi-select.
  - **Status** – Pending | Lunas | Expired.
- **Export** button for CSV/PDF.

#### Table
- Label: **"Daftar Permintaan Setor Uang"**.
- Columns from design:
  1. **No** – sequence.
  2. **Tanggal** – request date.
  3. **Toko** – branch store.
  4. **Nominal** – amount.
  5. **No. VA** – unique VA (copy/share).
  6. **Batas Waktu** – same-day expiry.
  7. **Status** – badge: Pending (yellow) | Lunas (green) | Expired (red).
  8. **Action** – Detail | Cetak | Hapus (inactive only).

- Status badges colored; auto-refresh via polling/websockets.

#### Pagination & States
- Standard pagination.
- Empty: **"Belum ada permintaan setor uang"**.

### Data & Behaviour Requirements
- Requests scoped to PT stores.
- Status auto from callbacks.
- One active (Pending) per store at a time.

### Security & Business Rules
- Own PT only.
- VA unique per request/store.

### Acceptance Criteria
- Table matches design; status badges update live.
- Filter by status/toko/date.

---

## FR‑038.2 Create Setor Uang Request

### Description
Admin creates deposit request → generates VA → notifies branch.

### UI & Interaction Requirements

- **+ Buat Permintaan** → modal **"Buat Permintaan Setoran"**.
- Form:
  - **Toko*** – dropdown (branches).
  - **Nominal*** – currency input.
  - **Catatan** – textarea (optional).
- **Simpan** → validate → generate VA → **"Permintaan berhasil dibuat. VA: [number]"** modal → notify branch dashboard.

#### Validation
- Valid toko/nominal > 0.
- No active Pending for selected toko.

### Data & Behaviour Requirements
- Create: request ID, toko, nominal, VA (generate unique), status=Pending, expiry=today EOD.
- Auto-notify branch (in-app/push).
- Log creation.

### Security & Business Rules
- Limit 1 Pending per toko.
- VA expires same-day.

### Acceptance Criteria
- Form matches design; VA generated on save.
- Prevents duplicate active requests per toko.

---

## FR‑038.3 Request Detail View

### Description
Monitor single request with VA, status, mutation preview.

### UI & Interaction Requirements

- **Action → Detail** → **Setor Uang / Detail [ID]**.
- Header: **No Request**, Toko, Nominal, **No. VA** (prominent/copy), Batas Waktu, Status.
- Timeline:
  - Created [time].
  - Paid [time] (if Lunas).
  - Mutation posted.
- **Bukti Pembayaran** – if manual override.
- Actions:
  - **Copy VA** | **Share to Branch** | **Cetak Instruksi**.
  - **Batalkan** (Pending only → Expired).

### Data & Behaviour Requirements
- Real-time status from callbacks.
- Mutation preview: central +Kredit, branch -Debit.

### Acceptance Criteria
- Shows VA prominently; timeline updates live.

---

## FR‑038.4 Auto-Verification via Callback

### Description
Payment gateway callback handling (system-automated).

### UI & Behaviour Requirements

- Backend endpoint receives callback → verify signature → if valid:
  - Status → **Lunas**.
  - Post mutations.
  - Notify Admin/branch.
- Frontend: table auto-refreshes (polling 30s or websocket).

### Data & Behaviour Requirements
- Only registered gateway callbacks accepted.
- Idempotent (duplicate OK).
- Expiry check: reject late payments.

### Security & Business Rules
- Signature validation mandatory.
- Same-day only.

### Acceptance Criteria
- Status changes from Pending → Lunas on valid callback.
- Mutations auto-posted.

---

## FR‑038.5 Expiry & Manual Actions

### Description
Handle expiry and manual overrides.

### UI & Interaction Requirements

- Cron/job: Pending → **Expired** at EOD.
- **Batalkan** (Pending): → Expired.
- **Expired VA unusable**.

### Data & Behaviour Requirements
- Auto-expiry daily.
- Manual cancel logs reason.

### Security & Business Rules
- No payments after expiry.
- 1 active max per toko.

### Acceptance Criteria
- Expiry updates status; prevents late callbacks.
