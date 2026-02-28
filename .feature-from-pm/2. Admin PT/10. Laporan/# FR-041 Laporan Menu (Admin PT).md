# FR-041 Laporan Menu (Admin PT)

## Feature Name
Laporan Generation – Report Download Interface

## Description
The **Laporan** page provides Admin PT with a date-range picker and dropdown to select/download various reports. All reports can be filtered by **lokasi, tanggal**, and exported as **CSV/PDF**. Reports include: Laporan Jatuh Tempo, SPK Detail, Mutasi Harian, Stok Opname, Outstanding, Biaya Lain/Tambah Modal/Tarik Modal, Omset Kanan Kiri, Jumlah Barang/SPK/Sisa Pinjaman/Lelangan, Fraud %, Lonjakan Merk/Tipe, Blacklist Customer/Barang, List NKB/SPK/Lelangan/Tambah Modal/Biaya Lain, Reminder SPK SMS/WA.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. Admin PT logged in with **Laporan** access.
2. Transaction data available for report generation.

---

## Postconditions

1. Selected report downloads as CSV/PDF with applied filters.

---

## FR‑041.1 Report Selection & Generation

### Description
Date picker + dropdown → generate/download report.

### UI & Interaction Requirements

#### Page Header
- Title: **"GADAI TOP Laporan Transaksi"**.

#### Report Controls
- **Laporan** dropdown with options:
  - Laporan Jatuh Tempo
  - SPK Detail (Pembayaran, Lelangan, Buku Bunga)
  - Laporan Mutasi Harian
  - Laporan Stok Opname
  - Laporan Perhitungan Outstanding
  - Laporan Perhitungan Biaya Lain, Tambah Modal, Tarik Modal
  - Laporan Omset Kanan Kiri
  - Jumlah Barang (unit), SPK, Sisa Pinjaman, Lelangan
  - Laporan Persentase Kemungkinan Fraud di Cabang
  - Laporan Lonjakan Merk/Tipe (Check Bom)
  - Laporan Blacklist Customer dan Barang
  - Laporan List NKB
  - Laporan List SPK
  - Laporan List Lelangan
  - Laporan List Tambah/Tarik Modal/Biaya Lain
  - Laporan SPK Reminder SMS/WA (Repeat Order/Jatuh Tempo)

- Date range: **Mulai** | **Sampai** (date pickers).
- **Lokasi** dropdown/filter (stores/PT).

#### Generate Button
- **"Download"** or **"Generate"** → loading → CSV/PDF download.
- Format selector: **CSV** | **PDF**.

#### Preview (Optional)
- Table preview before download.

### Data & Behaviour Requirements
- Backend generates reports based on selection:
  - **Jatuh Tempo**: Overdue SPK list.
  - **SPK Detail**: SPK + payments + auctions + interest book.
  - **Mutasi Harian**: Daily mutations.
  - **Stok Opname**: SO schedules/results.
  - **Outstanding**: Remaining loan calculations.
  - **Biaya Lain**: Operational + capital movements.
  - **Omset Kanan Kiri**: Bungaid SPK remaining + new SPK.
  - **Jumlah Barang**: Counts by unit/SPK/remaining/auctioned.
  - **Fraud %**: Branch fraud probability.
  - **Lonjakan**: Sudden merk/type spikes.
  - **Blacklist**: Customers/items.
  - **Lists**: NKB/SPK/Lelangan/Modal/Biaya.
  - **Reminder**: SPK for SMS/WA (repeat/overdue).
- Date range mandatory; lokasi optional (all PT if none).

### Security & Business Rules
- PT-scoped data.
- Download logs user/timestamp/report.

### Acceptance Criteria
- Dropdown lists all specified reports.
- Download generates correct filtered file.

---

## FR‑041.2 Report Filtering

### Description
Apply date/lokasi filters to reports.

### UI & Interaction Requirements
- Date pickers validate range (max 1 year?).
- **Lokasi**: multi-select stores.

### Data & Behaviour Requirements
- Filters passed to report generator.

### Acceptance Criteria
- Invalid dates show error.

---

## FR‑041.3 Report Download Formats

### Description
CSV for data, PDF for print.

### UI & Interaction Requirements
- Toggle **CSV** (spreadsheet) | **PDF** (formatted).
- Download starts immediately.

### Data & Behaviour Requirements
- CSV: raw tabular.
- PDF: headers, totals, branding.

### Acceptance Criteria
- Files match report content/filters.
