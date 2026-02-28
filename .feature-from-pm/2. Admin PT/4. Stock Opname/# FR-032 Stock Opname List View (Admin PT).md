# FR-032 Stock Opname List View (Admin PT)

## Feature Name
Stock Opname List View – Schedule Management for Admin PT

## Description
The system provides a **Stock Opname** page with two tabs for Admin PT: **List** (current FR) and **Kalender**. The List tab displays a paginated table of Stock Opname schedules, allowing Admin PT to view, filter, search, and manage schedules including creating new ones via a form.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. The user is logged in as Admin PT with access to **Stock Opname** module.
2. Admin PT is associated with one PT, and schedules are scoped to its stores (Toko).
3. "Mata" rules exist or are empty (highlights priority items from FR-031).

---

## Postconditions

1. Schedule list reflects actions (create, edit, delete).
2. Changes update Stock Opname progress and "Mata" highlights for Staff Stock Opname.

---

## FR-032.1 View Stock Opname List

### Description
Admin PT views, filters, searches, and paginates Stock Opname schedules on the List tab.

### UI & Interaction Requirements

#### Page Header & Tabs
- Page title: **Stock Opname**.
- Tabs: **List** (active) | **Kalender**.
- Breadcrumb: `Pages / Stock Opname / List`.
- Top-right: **"+ Jadwal SO"** button opens Add Schedule form (FR-032.2).

#### Search & Filter Bar
- Search input: placeholder **"Cari berdasarkan toko, petugas, atau catatan"**.
- Filter button/icon opens panel below table.

#### Table
- Label: **"Daftar Jadwal Stock Opname"**.
- Columns from Figma:
  1. **ID** – schedule ID.
  2. **Tanggal** – date.
  3. **Toko** – store name(s), supports multi.
  4. **Petugas SO** – staff name(s), supports multi.
  5. **Status** – Draft | Dijadwalkan | Berjalan | Selesai (colored badges).
  6. **Jml Barang** – total items vs scanned (e.g., "50/30").
  7. **Action** – three-dot menu: Detail | Edit | Delete.

- Row click: no navigation.
- Checkbox column for bulk actions (select all/deselect).
- Bulk **Hapus** button when selected.

#### Filter Panel
- Fields:
  - **Tanggal Mulai** – date.
  - **Sampai Dengan** – date.
  - **Toko** – multi-select dropdown.
  - **Petugas** – multi-select.
  - **Status** – multi-select checkboxes.
- Buttons: **Reset** | **Terapkan** | **Tutup**.

#### Pagination & States
- Rows per page: 10/25/50/100.
- "Showing X–Y of Z" | Previous/Next.
- Loading: skeleton.
- Empty: "Belum ada jadwal Stock Opname".
- Error: "Gagal memuat data" with **Retry**.

### Data & Behaviour Requirements
- Scope: schedules for Admin PT's PT/stores.
- Filters apply to date range, stores, staff, status.
- Status logic: auto-update based on scans/progress.
- "Mata" highlights: priority items shown in detail (from FR-031).

### Security & Business Rules
- View only own PT schedules.
- No hard delete; soft-delete flagged.
- Log all views/actions.

### Acceptance Criteria
- Table matches Figma: columns, status badges, multi-store/staff display.
- Filters/pagination limit to own PT; empty/error states shown.

---

## FR-032.2 Create & Edit Schedule (Jadwal SO)

### Description
Admin PT creates or edits Stock Opname schedule via form, selecting multi-stores/staff, viewing candidate items with "Mata" highlights.

### UI & Interaction Requirements

#### Navigation
- **+ Jadwal SO**: opens **Stock Opname / Tambah Jadwal**.
- Edit from Action: **Stock Opname / Edit Jadwal**.

#### Header
- Add: **"Tambah Jadwal SO"**.
- Edit: **"Edit Jadwal SO"**.

#### Form Sections
- **Detail Jadwal**:
  - **Tanggal*** – date picker.
  - **Toko*** – multi-select dropdown (stores under PT).
  - **Petugas SO*** – multi-select (Stock Opname staff).
  - **Catatan** – textarea.

- **Daftar Kandidat SO** table below form:
  - Columns: checkbox | Barang | Tipe | Nilai Pinjaman | Kondisi | "Mata" indicator (highlighted rows).
  - Auto-populated: active SPK items (unredeemed/unauctioned) from selected stores.
  - Search/filter within table.
  - Select all/none checkboxes.

#### Buttons
- **Batal** – back with unsaved warning.
- **Simpan** – validate/submit.

#### Validation
- Required: date, at least one store/staff.
- No overlapping "Berjalan" for same store/time.
- Candidates exclude redeemed/auctioned items.

#### Feedback
- Success: "Jadwal berhasil disimpan", refresh list.
- Error: inline per field.

### Data & Behaviour Requirements
- Create: new schedule with PT ID, date, multi-stores/staff, status=Draft.
- Edit: update fields, recompute candidates.
- Candidates: filter by "Mata" rules (FR-031), highlight priorities.

### Security & Business Rules
- Stores/staff limited to PT.
- Log create/edit with user/timestamp.

### Acceptance Criteria
- Form matches Figma: multi-selects, candidate table with "Mata" highlights.
- Save creates Draft schedule in list; candidates accurate.

---

## FR-032.3 View Stock Opname Schedule Detail

### Description
Shows full information and item list of a single Stock Opname schedule (Detail SO page), including header summary and detailed item table, in read‑only mode.

### UI & Interaction Requirements

#### Navigation
- Accessed from **Action → Detail** in the Stock Opname List table.
- Breadcrumb: `Stock Opname / Detail`.
- Page title: **SO/[Nomor SO]** (e.g., `SO/001`).

#### Header Section – Detail SO
- Section title: **Detail SO**.
- Layout 2–3 columns as in design, with read‑only text fields:
  - **No SO** (e.g., SO/001).
  - **Tanggal** (e.g., 25 November 2025 09:00 WIB).
  - **Toko** (one or multiple store names).
  - **Petugas SO** (one or multiple staff names).
  - **Syarat "Mata"** (e.g., Barang Mahal, Barang Penting).
  - **Uang di Toko** (numeric).
  - **Last Updated At** (date & time).
  - **Total Uang di Mutasi Terakhir pada [jam] WIB**.
  - **Catatan** (multi‑line text).
- Top‑right of page: **status badge** of schedule (e.g., Draft / Dijadwalkan / Berjalan / Selesai) and possible action button (e.g., **Dijadwalkan**).

#### Item List Section – Daftar Item
- Section title: **Daftar Item**.
- Table showing item‑level data for this SO, 1 row per SPK/barang.
- Columns (following layout in screenshot):
  1. **No** – sequence number.
  2. **Foto** – small thumbnail image of item (if available).
  3. **No. SPK** – SPK identifier.
  4. **Nama Barang** – item name (e.g., iPhone 15 Pro).
  5. **Tipe Barang** – item type (e.g., Handphone, Laptop).
  6. **Toko** – store where the item is located.
  7. **Petugas** – assigned Stock Opname staff.
  8. **Status Scan** – badge:
     - Belum Terscan.
     - Terscan.
  9. **Action** – three‑dot menu:
     - **Detail Item** – opens Detail Item page (see below).

- Header controls above table:
  - **Rows per page** dropdown: 10 / 25 / 50 / 100.
  - Search input for item (by SPK or item name).
  - **Filter** button → opens item‑level filter panel.

#### Item Filter Panel
- Fields:
  - **Mulai Dari** (Tanggal) – date.
  - **Sampai Dengan** (Tanggal) – date.
  - **Tipe Barang** – multi‑select dropdown (Handphone, Laptop, Drive, Smartwatch, Tablet, etc.).
  - **Toko** – multi‑select store dropdown.
- Buttons:
  - **Tutup** – close panel.
  - **Reset** – clear filters.
  - **Terapkan** – apply filters and reload item list.

#### QR Code Modal
- From Detail SO page, user can open QR Code SPK modal (e.g., via **QR SPK** tab/button near bottom).
- Modal content:
  - Large **QR Code SPK**.
  - Buttons:
    - **Tutup**.
    - **Print QR**.

#### Edit Jadwal SO Modal/Page (from Detail)
- From Detail SO view, Admin PT can open **Edit Jadwal SO** (same fields as FR‑032.2) via an **Edit** action.
- Form fields:
  - **Tanggal**.
  - **Toko** (multi‑select).
  - **Petugas SO** (multi‑select).
  - **Syarat "Mata"** (dropdown).
  - **Catatan**.
- Buttons:
  - **Batal** – with confirmation modal “Apakah Anda yakin?”.
  - **Simpan** – triggers success modal “Sukses! Data berhasil disimpan”.

#### Detail Item Page
- Navigated from **Daftar Item → Action → Detail** or row‑level link on item name.
- Breadcrumb: `Stock Opname / Detail SO / Detail Item`.
- Page title: **[Nama Barang]** (e.g., iPhone 15 Pro).
- Section **Detail Item** shows:
  - **No. SPK**.
  - **Tipe Barang**.
  - **Toko**.
  - **IMEI / Serial** (if any).
  - **Kondisi Barang** and description.
  - **Status Barang**.
  - **Status Pengembalian** / **Status Pengambilan** (if applicable).
  - **Status Scan** (e.g., Belum Terscan / Terscan).
  - **Status Validasi Marketing** (e.g., OK).
  - **Alasan** (if any).
  - **Bukti** – gallery of photos (thumbnails) at bottom.
- Button: **QR Code SPK** to open QR modal.

#### Confirmation & Success Modals
- Delete / critical change:
  - Modal **“Apakah Anda Yakin?”** with **Batal** and **Ya**.
- Success:
  - Modal **“Sukses! Data berhasil disimpan.”** with **Tutup**.

### Data & Behaviour Requirements
- Header data sourced from schedule master (SO entity): ID, date, stores, staff, “Mata” rule, money snapshot, notes, last updated.
- Item list data sourced from:
  - Active SPK items assigned to this SO.
  - Scan results from Stock Opname execution (status scan).
- Filters affect only items within this SO, not global SO list.
- When item scan status updates (by Staff SO), Detail SO page must reflect:
  - Updated **Status Scan** per item.
  - Updated aggregate counts (e.g., Showing 1–10 of 100 items).
- Detail Item page is read‑only for Admin PT; updates come from Stock Opname staff flows.

### Security & Business Rules
- Admin PT can view only SO detail belonging to their PT.
- No hard delete for SO or its items; all deletions are soft delete.
- All edits from Detail SO (e.g., Edit Jadwal SO) are logged with admin, timestamp, and old/new values.

### Acceptance Criteria
- Detail SO header and Daftar Item layout match the provided design (fields, labels, badges).
- Item filter panel filters only items under the current SO.
- Detail Item page shows complete item information and photo proofs as per design.
- QR Code SPK modal appears and can be closed or printed.
- Edit Jadwal SO from Detail page behaves identically to the main create/edit form and shows confirmation/success modals.
