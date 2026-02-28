# FR-036 Request Tambah Modal List (Admin PT)

## Feature Name
Request Tambah Modal – Pending Approval List for Admin PT

## Description
The **Tambah Modal** page for Admin PT has two tabs: **Request Tambah Modal** (current FR) and **History Tambah Modal**.  
The Request Tambah Modal tab displays **only Pending** "Tambah Modal" requests submitted by Store Staff.  
**Complete** and **Rejected** requests appear in the **History Tambah Modal** tab instead.  
Admin PT can approve, reject, or bulk delete these pending requests. Checkboxes are used **only for bulk delete**.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. The user is logged in as Admin PT with access to **Tambah Modal**.
2. Store Staff can create "Tambah Modal" requests for stores under the Admin PT's PT.
3. Only **Pending** requests appear in this tab.

---

## Postconditions

1. Approved requests → **Complete** status → move to **History** tab.
2. Rejected requests → **Rejected** status → move to **History** tab.
3. Bulk deleted requests disappear from the list.

---

## FR‑036.1 View Request Tambah Modal List

### Description
Displays **Pending only** "Tambah Modal" requests with filter, search, and bulk delete capabilities.

### UI & Interaction Requirements

#### Page Header & Tabs

- Page title: **"Tambah Modal"**.
- Breadcrumb: `Pages / Tambah Modal`.
- Tabs:
  - **Request Tambah Modal** (active) – **Pending requests only**.
  - **History Tambah Modal** – Complete/Rejected requests.

#### Toolbar Above Table

- **Rows per page** dropdown (10 / 25 / 50 / 100).
- Global search: placeholder **"Cari berdasarkan toko atau pengguna"**.
- **Filter** button → opens filter panel.
- When checkboxes selected:
  - **"X Selected"** label.
  - Red **"Hapus"** button for bulk delete **only**.

#### Request Table

- Section label: **"Daftar Request Tambah Modal"**.
- **All rows show Pending status** (no Complete/Rejected here).
- Columns:
  1. **Checkbox** – bulk delete selection only.
  2. **Tanggal Request** – submission date/time.
  3. **Dilakukan Oleh** – Staff avatar + name.
  4. **Nama Toko** – store name.
  5. **Alias** – store alias.
  6. **Nominal** – requested amount.
  7. **Status** – **Pending** badge (all rows).
  8. **Action** – three-dot menu:
     - **Setujui** → approval form (FR‑036.2).
     - **Tolak** → rejection form (FR‑036.3).
     - **Detail** (optional).

#### Filter Panel

- Fields:
  - **Last Update Mulai Dari** – date.
  - **Sampai Dengan** – date.
  - **Nominal Dari** – currency.
  - **Sampai Dengan** – currency.
  - **Toko** – dropdown ("Semua" option).

- Buttons: **Tutup** | **Reset** | **Terapkan**.

#### Pagination & States

- Standard pagination with loading/empty/error states.
- Empty: **"Belum ada request tambah modal"**.

### Data & Behaviour Requirements

- **Scope**: Pending requests only for Admin PT's PT stores.
- Filters work within Pending scope only.
- Post-approval/rejection: requests auto-move to History tab.

### Security & Business Rules

- Only Pending requests visible.
- No hard delete; soft delete for bulk action.

### Acceptance Criteria

- Table shows **Pending status only**; no Complete/Rejected rows.
- Approval/rejection moves requests to History tab.

---

## FR‑036.2 Approve Request Tambah Modal

### Description
Approve Pending request → **Complete** → move to History tab.

### UI & Interaction Requirements

- **Action → Setujui** → modal **"Setujui Request?"**.
- Fields:
  - **Bukti Transfer*** – file upload.
  - **Catatan** – textarea.
- Flow: **Simpan** → **"Apakah Anda Yakin?"** → **Ya** → **"Sukses! Data berhasil disimpan."**
- Request disappears from list (moves to History).

### Data & Behaviour Requirements

- Status → **Complete**.
- Store bukti transfer + catatan.
- Trigger financial mutation.

### Acceptance Criteria

- Pending row → disappears after approval.

---

## FR‑036.3 Reject Request Tambah Modal

### Description
Reject Pending request → **Rejected** → move to History tab.

### UI & Interaction Requirements

- **Action → Tolak** → modal **"Tolak Request?"**.
- **Catatan** – textarea.
- Flow: **Simpan** → confirm → success → row disappears.

### Data & Behaviour Requirements

- Status → **Rejected**.
- No financial impact.

### Acceptance Criteria

- Rejected requests move to History tab.

---

## FR‑036.4 Bulk Delete Pending Requests

### Description
Soft-delete selected Pending requests only.

### UI & Interaction Requirements

- Checkboxes → **"X Selected"** + **Hapus**.
- Modal: **"Apakah Anda Yakin?"** → **Ya** → **"Sukses! Data berhasil dihapus."**.

### Data & Behaviour Requirements

- Soft delete Pending requests.
- Complete/Rejected requests cannot be selected (not visible).

### Acceptance Criteria

- Checkboxes work only on Pending rows.
- Bulk delete removes from Request tab only.
