# FR-042 Notifikasi List (Admin PT)

## Feature Name
Daftar Notifikasi – Notification Center

## Description
The **Notifikasi** page displays a paginated table of notifications for Admin PT. Users can filter by date range (**Mulai Dari**, **Sampai Dengan**), read status, search, mark as read/unread, and clear notifications.

## Actor
- Admin PT

## Priority
Medium

---

## Preconditions

1. User logged in as Admin PT.
2. Notifications exist in system.

---

## Postconditions

1. Filters including date range update notification list.
2. Read status updates on interaction.

---

## FR‑042.1 View Notifikasi List

### Description
Table of notifications with read/unread status and date filtering.

### UI & Interaction Requirements

#### Page Header
- Title: **"GADAI TOP Notifikasi"**.
- Breadcrumb: `Pages / Notifikasi`.

#### Toolbar
- **Rows per page**: 10/25/50/100.
- Search input.
- **Filter** → filter panel.
- Top-right: **"Tandai Semua sebagai Terbaca"** | bell icon with unread count.

#### Table
- Label: **"Daftar Notifikasi"**.
- Columns:
  1. **Read Status** – dot/circle (filled=read, empty=unread).
  2. **Pesan** – notification message (click to detail/action).
  3. **Waktu** – timestamp.
  4. **Action** – three-dot: **Tandai Terbaca** | **Hapus**.

- Unread rows: bold/highlighted.

#### Filter Panel
- **Mulai Dari** – date picker.
- **Sampai Dengan** – date picker.
- **Status** – dropdown: Semua | Terbaca | Belum Terbaca.
- Buttons: **Tutup** | **Reset** | **Terapkan**.

#### Pagination & States
- Standard.
- Empty: **"Belum ada notifikasi"**.

### Data & Behaviour Requirements
- Filter by **date range (Waktu)** and read status.
- Date validation: Mulai Dari ≤ Sampai Dengan.

### Security & Business Rules
- User-specific notifications.

### Acceptance Criteria
- Filter panel includes **"Mulai Dari"** and **"Sampai Dengan"** date fields.
- Date filter correctly scopes notifications by timestamp.

---

## FR‑042.2 Mark Read/Unread

### Description
Update notification status.

### UI & Interaction Requirements
- Row click → mark read.
- **Action → Tandai Terbaca**.

### Data & Behaviour Requirements
- Backend updates read status.

### Acceptance Criteria
- Status dot changes immediately.

---

## FR‑042.3 Clear/Delete Notification

### Description
Remove notification.

### UI & Interaction Requirements
- **Action → Hapus** → confirm.

### Data & Behaviour Requirements
- Soft delete.

### Acceptance Criteria
- Row disappears.
