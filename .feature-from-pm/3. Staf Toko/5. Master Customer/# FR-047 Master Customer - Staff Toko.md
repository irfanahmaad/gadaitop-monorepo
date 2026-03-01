# FR-047 Master Customer - Staff Toko

## TITLE
**FR-047 Master Customer - Staff Toko** - Feature Name

## Description
Master Customer feature allows Staff Toko to add, edit, delete, and search customer records. Customer data is integrated across all PTs (visible globally). OCR upload for KTP enables automatic NIK extraction. Staff Toko can blacklist customers, with visual labeling (blacklisted customers cannot create SPK).

## Actor
- Staff Toko

## Priority
High

## Preconditions
1. User logged in as Staff Toko.
2. Access to camera/file upload for OCR KTP.

## Postconditions
1. Customer record created/updated/deleted.
2. Blacklist status applied and labeled.
3. Data synchronized across PTs.

---

## TITLE
**FR-047 Master Customer - FR047.1 View Customer List**

## Description
Display paginated table of customers with search, filter, and bulk actions.

## UI Interaction Requirements - Page Header
- Page title: `Master Customer`.
- Breadcrumb: GADAI TOP > Master Customer.

## UI Interaction Requirements - Table
- Columns (from Figma):
  - Checkbox (bulk select).
  - Avatar/photo.
  - Customer name.
  - NIK / No KTP.
  - Phone 1.
  - Address (shortened).
  - Status (Blacklist label if applicable).
  - Actions: Edit (`Ubah`), Delete (`Hapus`), View detail.
- Toolbar:
  - Search input (by name/NIK).
  - Filter panel: Status (All, Blacklist, Active), date range if applicable.
  - Buttons: `Tutup`, `Reset`, `Terapkan`.
  - Bulk actions: `Hapus Terpilih`.
  - `Tambah Data` button (primary).

## UI Interaction Requirements - States
- Blacklist label: Red badge/icon on blacklisted rows.
- Empty state: "Belum ada data customer".
- Pagination and rows per page selector.

## Data Behaviour Requirements
- Search across all PTs by name or NIK.
- List shows global customers (integrated data).

## Security / Business Rules
- Soft delete only (no hard delete).
- Blacklisted customers labeled and block SPK creation.

## Acceptance Criteria
1. Table shows customers with blacklist labels.
2. Search filters by name/NIK across PTs.
3. Bulk checkbox + `Hapus Terpilih` for multi-delete.

---

## TITLE
**FR-047 Master Customer - FR047.2 Add/Edit Customer (Tambah Data / Ubah)**

## Description
Form to create or update customer data, including OCR KTP for auto-NIK.

## UI Interaction Requirements - Form Modal/Page
- Title: `Tambah Data Customer` or `Ubah Data Customer`.
- Fields (mandatory unless noted):
  | Field | Type | Notes |
  |-------|------|-------|
  | Nama | Text | Required |
  | Alamat | Textarea | Full address |
  | Kota | Dropdown/Text |  |
  | Kecamatan | Text |  |
  | Kelurahan | Text |  |
  | Telepon 1 | Phone input | Required |
  | Telepon 2 | Phone input | Optional |
  | Nomor KTP | Text | Auto-filled via OCR |
  | Tanggal Lahir | Date picker |  |
  | Email | Email input | Optional |
  | NIK | Text | Auto-extracted via OCR KTP upload |
- OCR section:
  - Upload button: "Upload Foto KTP".
  - Preview image.
  - "Scan OCR" button → auto-populate NIK/No KTP.
- Blacklist toggle: Checkbox `Blacklist Customer` (with warning).
- Buttons: `Batal`, `Simpan`.

## Data Behaviour Requirements
- OCR processes KTP image → extracts NIK/No KTP → auto-fills fields.
- Save creates/updates record; sync across PTs.
- Blacklist: Sets flag; labeled in lists.

## Security / Business Rules
- Duplicate NIK check (global).
- Blacklist blocks SPK (enforced in SPK creation).
- Audit log for changes.

## Acceptance Criteria
1. OCR upload auto-fills NIK/No KTP correctly.
2. Form validates required fields.
3. Blacklist toggle saves and labels customer in list.

---

## TITLE
**FR-047 Master Customer - FR047.3 Delete Customer (Single/Bulk)**

## Description
Soft-delete single or multiple customers with confirmation.

## UI Interaction Requirements
- Single delete: Click `Hapus` → confirmation modal (`Apakah yakin hapus?`).
- Bulk: Select checkboxes → `Hapus Terpilih` → multi-confirm modal.

## Data Behaviour Requirements
- Soft delete: Set status inactive (retain data for audit).
- Remove from active lists/searches.

## Security / Business Rules
- Prevent delete if customer has active SPK/NKB.
- Log deletion reason/user.

## Acceptance Criteria
1. Single delete removes row after confirmation.
2. Bulk delete processes selected items.
3. Cannot delete customers with linked transactions.

---

## TITLE
**FR-047 Master Customer - FR047.4 Search and Filter**

## Description
Global search and filtering across PT-integrated data.

## UI Interaction Requirements
- Search bar: Real-time filter by name/NIK.
- Filter panel: Status (Semua, Blacklist, Aktif); apply with `Terapkan`.

## Data Behaviour Requirements
- Cross-PT search (all customers visible).
- Blacklist filter shows labeled results.

## Security / Business Rules
- Staff Toko sees all (per RS integration).

## Acceptance Criteria
1. Search finds by partial name/NIK.
2. Filters combine (e.g., Blacklist + date).
