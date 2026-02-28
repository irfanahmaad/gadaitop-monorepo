# FR-039 Mutasi/Transaksi Tiap Toko (Admin PT)

## Feature Name
Mutasi Transaksi – Store Transaction Journal List

## Description
The **Mutasi/Transaksi** page displays transaction journals/mutations for each store under the PT. Transactions include tambah modal, setor modal, SPK nasabah, operasional harian toko, and pembayaran nasabah. Admin PT can filter, search, and view details of all store transactions.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. User logged in as Admin PT.
2. Transaction data exists from store activities.

---

## Postconditions

1. Filters update displayed transactions.
2. Detail shows transaction information.

---

## FR‑039.1 View Mutasi Transaksi List

### Description
Displays searchable, filterable table of store transactions.

### UI & Interaction Requirements

#### Page Header
- Title: **"GADAI TOP Mutasi/Transaksi"**.
- Breadcrumb: `Pages / Mutasi/Transaksi`.

#### Toolbar Above Table
- **Rows per page**: 10/25/50/100.
- Search input: placeholder **"Cari berdasarkan SPK atau deskripsi"**.
- **Filter** button → filter panel.

#### Table
- Label: **"Daftar Mutasi"**.
- Columns from Figma:
  1. **Tanggal** – transaction date/time.
  2. **User** – avatar + name.
  3. **Jenis** – transaction type (Tambah Modal, Setor Modal, SPK, Pembayaran, Operasional).
  4. **No SPK/NKB** – reference number.
  5. **Deskripsi** – description.
  6. **Debit** – debit amount.
  7. **Kredit** – credit amount.
  8. **Saldo** – running balance.

#### Filter Panel
- Fields:
  - **Jenis** – dropdown (Tambah Modal, Setor Modal, SPK, etc.).
  - **Tanggal Mulai** – date.
  - **Tanggal Sampai** – date.
  - **Toko** – dropdown.
- Buttons: **Tutup** | **Reset** | **Terapkan**.

#### Pagination & States
- Standard pagination.
- Empty: **"Belum ada mutasi transaksi"**.
- Loading: skeleton.

### Data & Behaviour Requirements
- Transactions aggregated per store under PT.
- Balance calculation: running total Debit-Kredit.
- Types: tambah modal, setor modal, SPK nasabah, operasional harian, pembayaran nasabah.

### Security & Business Rules
- View PT stores only.
- Read-only.

### Acceptance Criteria
- Table matches Figma: columns, debit/kredit/saldo.
- Filter by jenis/date/toko.

---

## FR‑039.2 Filter Mutasi Transaksi

### Description
Apply filters to transaction list.

### UI & Interaction Requirements
- Filter panel as shown.
- **Terapkan** reloads page 1.

### Data & Behaviour Requirements
- Server-side filtering.

### Acceptance Criteria
- Filters reduce list correctly.

---

## FR‑039.3 View Transaction Detail

### Description
Detail view of single transaction.

### UI & Interaction Requirements
- From row click → **"Detail Mutasi"** modal.
- Shows full info: tanggal, user, jenis, SPK/NKB, deskripsi, debit, kredit, saldo.

### Data & Behaviour Requirements
- Linked SPK/NKB details if applicable.

### Acceptance Criteria
- Modal shows complete transaction data.
