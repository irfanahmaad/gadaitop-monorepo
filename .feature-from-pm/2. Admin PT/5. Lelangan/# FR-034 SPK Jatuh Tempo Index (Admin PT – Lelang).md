# FR-034 SPK Jatuh Tempo Index (Admin PT – Lelang Tab)

## Feature Name
SPK Jatuh Tempo Index – Overdue Pledged Items List for Auction Preparation

## Description
The **Lelang** page for Admin PT has two tabs: **SPK Jatuh Tempo** (current FR) and **Batch Lelang**. The SPK Jatuh Tempo tab displays a paginated, filterable table of overdue SPK items (jatuh tempo) that are eligible for auction distribution. Admin PT can view details, print lists, and initiate batch creation for Staff Lelang pickup and Marketing validation. Rows highlighted in **red** indicate items matching **"Mata" rules** (priority from FR-031).

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. User logged in as Admin PT with access to **Lelang** module.
2. SPK items exist with due date passed and status not redeemed/auctioned.
3. PT association limits data to own stores.
4. "Mata" rules configured (FR-031) for priority highlighting.

---

## Postconditions

1. List updates after filters, pagination, or batch creation.
2. Items assigned to batches are marked/excluded from index.

---

## FR-034.1 View SPK Jatuh Tempo List

### Description
Displays searchable, filterable table of overdue SPK items ready for auction batching, with **red row highlighting** for items matching "Mata" priority rules.

### UI & Interaction Requirements

#### Page Header & Tabs
- Title: **Lelang**.
- Tabs: **SPK Jatuh Tempo** (active) | **Batch Lelang**.
- Breadcrumb: `Pages / Lelang / SPK Jatuh Tempo`.
- Top-right buttons:
  - **"Cetak"** (Print List) – generates PDF/export.
  - **"+ Batch Lelang"** – opens Batch Creation form (FR-034.2).
- Legend (optional tooltip/icon): **"Baris merah = Prioritas 'Mata'"**.

#### Search & Filter Bar
- Global search input: placeholder **"Cari berdasarkan SPK, barang, atau nasabah"**.
- **Filter** button → opens advanced filter panel.

#### Table
- Label: **"Index Jatuh Tempo"** or **"Daftar SPK Jatuh Tempo"**.
- Columns from Figma:
  1. Checkbox (for bulk select to batch).
  2. **No** – row number.
  3. **Foto** – item thumbnail.
  4. **No. SPK** – SPK ID (clickable to detail).
  5. **Barang** – item name.
  6. **Tipe** – item type.
  7. **Toko** – store location.
  8. **Tanggal Jatuh Tempo** – due date (overdue highlighted red).
  9. **Status** – badge (e.g., Jatuh Tempo, Ready for Lelang).
  10. **Action** – three-dot: **Detail** | **QR SPK** | **Tambah ke Batch**.

- **Row Highlighting**:
  - Entire row background **red** (or red stripe/shade) for items matching any active **"Mata" rule** (e.g., high value, specific type/condition from FR-031).
  - Non-"Mata" rows: default white/light.
  - Hover: amplify highlight; tooltip **"Prioritas 'Mata': [Rule Name]"**.

- Header checkbox: select all on page (respects highlights).
- Bulk **"Buat Batch"** button when items selected (prioritize "Mata" in preview).

#### Filter Panel
- **Tanggal Jatuh Tempo Mulai** | **Sampai Dengan** – date range.
- **Tipe Barang** – multi-select dropdown.
- **Lokasi/Toko** – multi-select.
- **"Mata" Rules** – checkboxes to filter only priority or all.
- **Segmentasi** – dropdown (e.g., 1 bulan, 2 bulan).
- Buttons: **Reset** | **Terapkan** | **Tutup**.

#### Pagination & States
- Rows per page: 10/25/50/100.
- "Showing X–Y of Z" | Previous/Next (e.g., "50 'Mata' items").
- Loading: skeleton rows.
- Empty: "Belum ada SPK jatuh tempo".
- Error: "Gagal memuat data" + **Retry**.

### Data & Behaviour Requirements
- Items: SPK where due date < today, not redeemed/auctioned/picked.
- **"Mata" Matching**: Auto-apply FR-031 rules (type, price range, condition) → red highlight.
- Overdue: due date red regardless of "Mata".
- Filters include **"Mata" toggle**; search scans SPK/barang/nasabah.
- Bulk: prefer/select "Mata" items first.

### Security & Business Rules
- Scope: own PT/stores only.
- "Mata" highlights read-only from rules.
- Log filters/prints/selections.

### Acceptance Criteria
- Red rows exactly match "Mata" criteria; hover tooltip explains rule.
- Filters preserve highlights; print includes color/shading.
- Table matches Figma with visual priority distinction.

---

## FR-034.2 Create Auction Batch from Index

### Description
Select items (prioritizing red "Mata" rows) and create **Batch Lelang**.

### UI & Interaction Requirements
- Trigger: bulk **Buat Batch** or **Action → Tambah ke Batch**.
- Modal: **"Buat Batch Lelang"** – preview selected with **red-highlighted "Mata" items** prominent.
- Form: **Nama Batch**, **Toko**, **User Lelang**.
- Buttons: **Batal** | **Buat Batch**.

### Data & Behaviour Requirements
- Batch inherits "Mata" status per item.

### Acceptance Criteria
- Preview shows red highlights; creates batch excluding assigned items.

---

## FR-034.3 View SPK Item Detail

### Description
Single overdue SPK detail with "Mata" indicator.

### UI & Interaction Requirements
- **"Mata" badge/highlight** in header if applicable.
- Rest identical to previous.

### Data & Behaviour Requirements
- Flag "Mata" match.

### Acceptance Criteria
- Detail reflects row color logic.

---

## FR-034.4 Print & Export Index

### Description
Printable list preserving red "Mata" highlights.

### UI & Interaction Requirements
- PDF: shaded red rows, legend footer.

### Data & Behaviour Requirements
- Export filtered data with "Mata" flag.

### Acceptance Criteria
- Print matches screen highlights.

---

## FR-034.5 Delete Item from Index (Single/Bulk)

### Description
Remove ineligible (preserves "Mata" logic).

### UI & Interaction Requirements
- Confirm preserves highlights on remaining rows.

### Acceptance Criteria
- List refreshes with correct red rows.
