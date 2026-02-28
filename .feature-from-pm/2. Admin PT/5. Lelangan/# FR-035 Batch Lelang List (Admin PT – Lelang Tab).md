# FR-035 Batch Lelang List (Admin PT – Lelang Tab)

## Feature Name
Batch Lelang Management – Auction Batch Monitoring and Approval for Admin PT

## Description
The **Batch Lelang** tab (within Lelang page) displays a paginated table of auction batches created from SPK Jatuh Tempo (FR-034). Admin PT monitors progress (Staff Lelang pickup → Staff Marketing validation), views item details, and approves batches for final auction once all items are **OK** validated. Red-highlighted rows indicate "Mata" priority items.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. User logged in as Admin PT with **Lelang** access.
2. Batches created from SPK Jatuh Tempo index (FR-034).
3. Items processed by Staff Lelang (pickup scan) and Staff Marketing (validation).

---

## Postconditions

1. Batch status updates (Draft → Didistribusikan → Diambil → Validasi → Siap Lelang).
2. Approved batches move to auction-ready state.

---

## FR-035.1 View Batch Lelang List

### Description
Filterable table of batches with progress monitoring; red rows for "Mata" priority items.

### UI & Interaction Requirements

#### Page Header & Tabs
- Title: **Lelang**.
- Tabs: **SPK Jatuh Tempo** | **Batch Lelang** (active).
- Breadcrumb: `Pages / Lelang / Batch Lelang`.

#### Search & Filter Bar
- Search: **"Cari berdasarkan batch ID, toko, atau staff"**.
- **Filter** → panel with:
  - **Tanggal Buat** range.
  - **Toko** multi-select.
  - **User Lelang** dropdown.
  - **Status** multi-select: Draft | Didistribusikan | Diambil | Validasi | Siap Lelang | OK by Admin.

#### Table
- Label: **"Daftar Batch Lelang"**.
- Columns:
  1. Checkbox (bulk actions).
  2. **ID Batch** (click to detail).
  3. **Toko** – store(s).
  4. **Penanggung Jawab** – assigned Lelang staff.
  5. **Jumlah Item** – total (e.g., 25).
  6. **Progress** – bar (e.g., 80%: Diambil 20/25, Validasi 15/20).
  7. **Status** – colored badge.
  8. **Action** – three-dot: **Detail** | **Edit** | **Hapus** | **Approve** (if ready).

- **Row Highlighting**: Red background for batches containing **"Mata" items** (prioritize in progress bar).
- Bulk: **Hapus** | **Distribusikan Ulang**.

#### Pagination & States
- Standard pagination.
- Empty: "Belum ada batch lelang".
- Legend: Status colors + "Merah = Ada item 'Mata'".

### Data & Behaviour Requirements
- Batches from FR-034.2; status auto-updates on staff actions.
- Progress: % based on pickup/validation per item.
- "Mata": inherit from SPK; highlight if any item matches FR-031.

### Security & Business Rules
- Own PT batches only.
- Approve only when 100% OK validated.

### Acceptance Criteria
- Red rows for "Mata" batches; progress accurate.
- Matches Figma table with badges/progress.

---

## FR-035.2 Batch Detail View

### Description
Full batch details, item list, and approval.

### UI & Interaction Requirements
- From **ID Batch** click: **Lelang / Detail Batch [ID]**.
- Header: **ID Batch**, Toko, Staff Lelang, Status, Jumlah Item, Progress bar/counters.
- **Daftar Item Lelang** table:
  | No | Foto | No. SPK | Tipe | Lokasi | Status Pengambilan (Scanned/Not) | Status Validasi (OK/Return/Reject + Alasan) | Action (Detail/QR) |
  - Red row per "Mata" item.
  - Item filter/search.
- **Approval Section** (if all items OK):
  - Button **"Approve Batch"** → confirm → status **Siap Lelang**.
- Buttons: **Edit Batch** | **Hapus Batch** | **Cetak Daftar**.

#### QR SPK Modal
- Per item: large QR + **Print**.

### Data & Behaviour Requirements
- Aggregate staff updates (scans/validations).
- Approve: set batch approved, notify auction flow.

### Acceptance Criteria
- Item table shows per-item status; approve disabled until complete.

---

## FR-035.3 Create/Edit Batch (Inline)

### Description
Edit batch assignment post-creation.

### UI & Interaction Requirements
- **Edit** → modal: reassign staff, add/remove items (from eligible SPK).
- Same form as FR-034.2.

### Data & Behaviour Requirements
- Update batch; refresh statuses.

### Acceptance Criteria
- Edits propagate to staff views.

---

## FR-035.4 Approve Batch

### Description
Final admin approval after full validation.

### UI & Interaction Requirements
- Enabled in detail when progress=100% OK.
- Modal: **"Approve [Batch ID]? All items validated OK."** → **Ya** → success "Batch disetujui untuk lelang".

### Data & Behaviour Requirements
- Check: all items scanned + OK (no Return/Reject).
- Set status **Siap Lelang**; log approval.

### Security & Business Rules
- Irreversible; only Admin PT.

### Acceptance Criteria
- Button appears only when ready; updates status.

---

## FR-035.5 Print & Delete Batch

### Description
Export batch list; soft-delete inactive batches.

### UI & Interaction Requirements
- **Cetak**: PDF with items, statuses, QR codes.
- **Hapus**: confirm modal; bulk OK.

### Data & Behaviour Requirements
- Soft-delete; exclude from lists.

### Acceptance Criteria
- Print includes progress/"Mata" highlights.
