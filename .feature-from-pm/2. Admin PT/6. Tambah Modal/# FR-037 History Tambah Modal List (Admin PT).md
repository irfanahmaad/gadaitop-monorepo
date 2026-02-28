# FR-037 History Tambah Modal List (Admin PT)

## Feature Name
History Tambah Modal – Read-Only Archive for Admin PT

## Description
The **History Tambah Modal** tab (within Tambah Modal page) displays **Complete** and **Rejected** "Tambah Modal" requests that were processed from the **Request Tambah Modal** tab (FR-036).  
This is a **read-only** view where Admin PT can **filter and search** past requests, view details, and **export/print** records. **No editing, approving, rejecting, or deleting** is possible here.  
**No checkboxes** or bulk actions are available.

## Actor
- Admin PT

## Priority
Medium

---

## Preconditions

1. User logged in as Admin PT with **Tambah Modal** access.
2. Requests exist with **Complete** or **Rejected** status from FR-036 processing.
3. Data scoped to Admin PT's PT stores.

---

## Postconditions

1. Filters update the displayed history list.
2. Detail views show read-only request information.

---

## FR‑037.1 View History Tambah Modal List

### Description
Read-only table of processed (Complete/Rejected) requests with filtering and search.

### UI & Interaction Requirements

#### Page Header & Tabs

- Page title: **"Tambah Modal"**.
- Breadcrumb: `Pages / Tambah Modal`.
- Tabs:
  - **Request Tambah Modal** (FR-036) – Pending only.
  - **History Tambah Modal** (active) – Complete/Rejected only.

#### Toolbar Above Table

- **Rows per page** dropdown (10 / 25 / 50 / 100).
- Global search input: placeholder **"Cari berdasarkan toko, nominal, atau catatan"**.
- **Filter** button → opens filter panel.
- **Export/Cetak** button → generates PDF/CSV of filtered list.
- **No checkboxes** or bulk action buttons (read-only).

#### History Table

- Section label: **"Daftar History Tambah Modal"**.
- Columns (matching Request tab design):
  1. **Tanggal Request** – submission date/time.
  2. **Dilakukan Oleh** – Staff avatar + name.
  3. **Nama Toko** – store name.
  4. **Alias** – store alias.
  5. **Nominal** – amount.
  6. **Status** – badge: **Complete** (green) or **Rejected** (red).
  7. **Action** – three-dot menu **(read-only)**:
     - **Detail** → opens Detail Request modal/page (FR‑037.2).
     - **No Setujui/Tolak/Hapus** actions available.

- Row click: opens Detail (or via Action menu).
- Status badges colored per design.

#### Filter Panel

- Fields (identical to Request tab):
  - **Last Update Mulai Dari** – date.
  - **Sampai Dengan** – date.
  - **Nominal Dari** – currency.
  - **Sampai Dengan** – currency.
  - **Toko** – dropdown ("Semua").
  - **Status** – dropdown: **Complete**, **Rejected**, **Semua**.

- Buttons: **Tutup** | **Reset** | **Terapkan**.

#### Pagination & States

- Standard: "Showing X–Y of Z" | Previous/Next.
- Loading: skeleton.
- Empty: **"Belum ada history tambah modal"**.
- Error: **"Gagal memuat data"** + **Retry**.

### Data & Behaviour Requirements

- **Scope**: Complete/Rejected requests only for Admin PT's PT.
- Search: matches toko, staff, nominal, catatan.
- Filters: date (last update), nominal range, toko, status.
- Sorting: default Tanggal Request descending.

### Security & Business Rules

- **Read-only**: no status changes or deletions.
- View only own PT data.
- Export logs access.

### Acceptance Criteria

- Table matches Request tab columns but **shows Complete/Rejected only**.
- **No checkboxes**, **no Setujui/Tolak/Hapus** in Action menu.
- Filters work within Complete/Rejected scope.

---

## FR‑037.2 View Request Detail (Read-Only)

### Description
Read-only detail view of a processed request.

### UI & Interaction Requirements

- Trigger: **Action → Detail** or row click.
- Modal/Page: **"Detail Request Tambah Modal"**.
- Read-only fields:
  - **No Request** – auto-generated ID.
  - **Tanggal Request**.
  - **Dilakukan Oleh** – Staff info.
  - **Nama Toko / Alias**.
  - **Nominal**.
  - **Status** (Complete/Rejected badge).
  - **Bukti Transfer** – thumbnail/link to proof (if Complete).
  - **Catatan Admin** – approval/rejection note.
  - **Tanggal Proses** – when approved/rejected.
- Buttons:
  - **Tutup** or **Kembali**.
  - **Cetak** – print single request.
  - **No Edit** button.

#### Bukti Transfer Preview
- If Complete: shows uploaded file thumbnail + download.

### Data & Behaviour Requirements

- Full historical data including bukti and notes.
- No mutations.

### Acceptance Criteria

- Matches Figma Detail Request modal.
- All fields read-only; shows bukti for Complete requests.

---

## FR-037.3 Export/Print History

### Description
Download filtered history as PDF/CSV.

### UI & Interaction Requirements

- **Cetak/Export** button → generates report.
- PDF: table format with all columns, filters footer.
- CSV: raw data for Excel.

### Data & Behaviour Requirements

- Current filtered view.
- Includes status, bukti links.

### Acceptance Criteria

- Export matches filtered table; downloadable.

---

## FR-037.4 Filter & Search History

### Description
Dynamic filtering identical to Request tab but scoped to processed requests.

### UI & Interaction Requirements

- Same panel as FR-036.1 but **Status** limited to Complete/Rejected.
- Real-time reload on **Terapkan**.

### Data & Behaviour Requirements

- Server-side filtering on historical data.

### Acceptance Criteria

- Filters show accurate counts for Complete vs Rejected.
