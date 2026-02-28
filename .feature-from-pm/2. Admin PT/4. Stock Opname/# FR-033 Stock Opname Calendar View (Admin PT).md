# FR-033 Stock Opname Calendar View (Admin PT)

## Feature Name
Stock Opname Calendar View – Schedule Management for Admin PT

## Description
The system provides the **Kalender** tab within the Stock Opname page for Admin PT. This tab displays Stock Opname schedules in a monthly calendar view, allowing Admin PT to view existing schedules, navigate dates, filter by store/staff, and create new schedules via a form. Detail views are identical to List tab (FR-032.3).

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

1. Calendar reflects actions (create, edit, delete).
2. Changes update Stock Opname progress and "Mata" highlights for Staff Stock Opname.

---

## FR-033.1 View Stock Opname Calendar

### Description
Admin PT views, filters, and navigates Stock Opname schedules on the **Kalender** tab using a monthly calendar interface.

### UI & Interaction Requirements

#### Page Header & Tabs
- Page title: **Stock Opname**.
- Tabs: **List** | **Kalender** (active).
- Breadcrumb: `Pages / Stock Opname / Kalender`.
- Top-right: **"+ Jadwal SO"** button opens Add Schedule form (FR-033.2).

#### Calendar Header
- Month/Year display: e.g., **November 2025** (clickable to open month selector).
- Navigation: **< Bulan Sebelumnya** | **Bulan Selanjutnya >**.
- **Today** button to jump to current month.
- View toggle: **Month** | **Week** | **Day** (if present; default Month as in Figma).

#### Calendar Grid
- Standard monthly grid: 6 rows x 7 columns (Sun–Sat).
- Empty days: blank/light gray.
- Days with schedules:
  - Dot indicator (e.g., blue/red dot count) for number of schedules.
  - Hover/click: tooltip/popup with schedule summary:
    - **Toko**: store name(s).
    - **Petugas SO**: staff name(s).
    - **Status**: Draft/Dijadwalkan/Berjalan/Selesai (colored).
    - **Jml Barang**: total vs scanned.
  - Click day: opens schedule list for that day or navigates to detail.
- Selected day: highlighted.

#### Sidebar – Filter & Legend
- Left sidebar (collapsible):
  - **Filter** section:
    - **Toko**: multi-select dropdown.
    - **Petugas SO**: multi-select dropdown.
    - **Status**: multi-select (Draft, Dijadwalkan, Berjalan, Selesai).
  - Buttons: **Reset** | **Terapkan**.
- **Legend** section: color-coded status dots (e.g., Draft=gray, Berjalan=orange).

#### Quick Actions & States
- **Tambah Jadwal SO** form overlay or drawer when **+ Jadwal SO** clicked.
- Loading: spinner over calendar.
- Empty: overlay message "Belum ada jadwal Stock Opname".
- No schedules on selected date: "Tidak ada jadwal pada tanggal ini".

#### Mobile Responsiveness
- Calendar stacks vertically; sidebar collapses to top filter bar.

### Data & Behaviour Requirements
- Calendar loads schedules for displayed month, scoped to PT/stores.
- Dots aggregate schedules per day (max count shown, e.g., "+3").
- Filters dynamically update calendar dots/highlights.
- "Mata" rules influence candidate counts in tooltips (priority highlighted).

### Security & Business Rules
- View only own PT schedules.
- No hard delete; soft-delete removes from calendar.
- Log views/filters.

### Acceptance Criteria
- Calendar layout matches Figma: header nav, grid with dots, sidebar filters.
- Hover/click on days shows accurate multi-schedule tooltip.
- Filters hide/show dots correctly; navigation preserves filters.

---

## FR-033.2 Create & Edit Schedule (Kalender Mode)

### Description
Admin PT creates or edits schedules directly from calendar context, identical to List tab form (FR-032.2).

### UI & Interaction Requirements
- **+ Jadwal SO** or day click → opens overlay/modal **Tambah Jadwal SO** / **Edit Jadwal SO**.
- Form identical to FR-032.2:
  - **Tanggal** (pre-filled from clicked day).
  - **Toko** (multi-select).
  - **Petugas SO** (multi-select).
  - **Catatan**.
  - **Daftar Kandidat SO** table with checkboxes, "Mata" highlights.
- Buttons: **Batal** | **Simpan**.

### Data & Behaviour Requirements
- Same as FR-032.2; pre-populate date from calendar selection.
- Post-save: refresh calendar view.

### Acceptance Criteria
- Form opens from calendar context; date pre-filled.
- Save updates calendar dots immediately.

---

## FR-033.3 View Schedule Detail

### Description
Identical to List tab detail (FR-032.3). Accessed via calendar day click → schedule row → **Detail**.

### UI & Interaction Requirements
- Navigation: Calendar day → daily schedule list → **Detail** → **Stock Opname / Detail SO [ID]**.
- All UI, data, modals same as FR-032.3 (header, Daftar Item table, filters, QR modal, Detail Item, Edit Jadwal SO).

### Data & Behaviour Requirements
- Same as FR-032.3.

### Acceptance Criteria
- Seamless navigation from calendar to identical detail view.

---

## FR-033.4 Delete Schedule (Calendar)

### Description
Soft-delete from calendar context, identical to FR-032.4.

### UI & Interaction Requirements
- From tooltip/day list **Action → Delete** or bulk from daily view.
- Modal: "Apakah Anda yakin?" → **Ya**/**Batal** → success "Data berhasil dihapus".
- Refresh calendar.

### Data & Behaviour Requirements
- Soft-delete; cannot delete active (Berjalan/Selesai).

### Acceptance Criteria
- Delete removes dot from calendar; matches List delete flow.
