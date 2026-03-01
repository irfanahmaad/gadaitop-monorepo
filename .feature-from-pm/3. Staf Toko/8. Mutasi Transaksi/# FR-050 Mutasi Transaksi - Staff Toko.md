# FR-050 Mutasi Transaksi - Staff Toko

## TITLE
**FR-050 Mutasi Transaksi - Staff Toko** - Feature Name

## Description
Mutasi/Transaksi page displays journal entries for the branch (toko), including tambah modal, setor modal, SPK nasabah transactions, daily operations, and customer payments (NKB). Read-only ledger view with filters and export.

## Actor
- Staff Toko

## Priority
Medium

## Preconditions
1. User logged in as Staff Toko.
2. Transactions exist from SPK/NKB/Tambah Modal/Setor Uang.

## Postconditions
- View/export filtered mutasi data.

---

## TITLE
**FR-050 Mutasi Transaksi - FR050.1 View Mutasi Table**

## Description
Paginated, filterable table of all branch transactions.

## UI Interaction Requirements - Page Header
- Page title: `Mutasi / Transaksi`.
- Breadcrumb: GADAI TOP > Mutasi / Transaksi.

## UI Interaction Requirements - Table
- Columns (from Figma):
  - Date (`Tanggal`).
  - Description/Type (`Deskripsi`: Tambah Modal, Setor Uang, SPK Nasabah, Operasional Harian, Pembayaran Nasabah).
  - Debit (`Debet`).
  - Credit (`Kredit`).
  - Balance (`Saldo`).
  - Reference (SPK/NKB ID, status).
  - Actions: Detail (`Lihat Detail` red button).
- Toolbar:
  - Filter panel: Date range `Mulai Dari` to `Sampai Dengan`.
  - Buttons: `Tutup`, `Reset`, `Terapkan`, `Ekspor` (CSV/PDF).
  - Search input.
  - Pagination selector.

## UI Interaction Requirements - Filter Panel
- Date pickers: `Mulai Dari`, `Sampai Dengan`.
- Type filter dropdown (all types).
- Status if applicable.

## Data Behaviour Requirements
- Transactions include:
  - Tambah modal (Credit from Admin PT).
  - Setor modal (Debit to pusat).
  - SPK nasabah (Debit for loans).
  - Operasional harian (Debit/Credit).
  - Pembayaran nasabah (Credit from NKB).
- Running balance calculated.

## Security / Business Rules
- Read-only for Staff Toko (view own toko mutasi).
- Audit trail preserved.

## Acceptance Criteria
1. Table shows all transaction types with Debet/Kredit/Saldo.
2. Filters by date/type refresh table.
3. `Ekspor` downloads filtered data.

---

## TITLE
**FR-050 Mutasi Transaksi - FR050.2 Transaction Detail View**

## Description
View full details of a specific mutasi entry.

## UI Interaction Requirements - Detail Modal
- Click `Lihat Detail` → modal:
  - Transaction header: Date, type, amount, balance impact.
  - Breakdown: Linked SPK/NKB/Modal ID, customer/staff names.
  - Attachments: Proof (e.g., transfer bukti).
  - Status/history timeline.
  - Buttons: `Tutup`.

## Data Behaviour Requirements
- Drill-down shows source transaction (e.g., SPK details for nasabah payment).

## Security / Business Rules
- View-only; no edits.

## Acceptance Criteria
1. Detail shows full context (linked records).
2. Attachments/proof viewable.

---

## TITLE
**FR-050 Mutasi Transaksi - FR050.3 Export and Filter**

## Description
Export filtered data and advanced filtering.

## UI Interaction Requirements
- `Ekspor` button → download CSV/PDF of visible table.
- Filter validation: End date ≥ start date.

## Data Behaviour Requirements
- Export includes all columns + full data.
- Filters persist on page reload.

## Security / Business Rules
- Exports watermarked/timestamped.

## Acceptance Criteria
1. Export matches filtered table.
2. Date validation prevents invalid ranges.
