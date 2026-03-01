# FR-051 Notifikasi - Staff Toko

## TITLE
**FR-051 Notifikasi - Staff Toko** - Feature Name

## Description
Notifikasi page displays user-specific notifications (e.g., Tambah Modal approval, Setor Uang requests, SPK/NKB updates) in a paginated table. Staff Toko can filter by date/status, mark read/unread, delete individually or bulk, and view details.

## Actor
- Staff Toko

## Priority
Medium

## Preconditions
1. User logged in as Staff Toko.
2. Notifications exist (system-generated).

## Postconditions
1. Notifications marked read/deleted.
2. Unread count updates (bell icon).

---

## TITLE
**FR-051 Notifikasi - FR051.1 View Notifikasi List**

## Description
Paginated table of notifications with filters and bulk actions.

## UI Interaction Requirements - Page Header
- Page title: `Notifikasi`.
- Breadcrumb: GADAI TOP > Notifikasi.
- Top-right: Bell icon with unread count badge.

## UI Interaction Requirements - Table
- Columns:
  - Read status (dot: filled=read, empty=unread; bold unread rows).
  - Message (`Pesan` – clickable to detail).
  - Timestamp (`Waktu`).
  - Actions (3-dot menu): `Tandai Terbaca`, `Hapus`.
- Toolbar:
  - Label: `Daftar Notifikasi`.
  - Search input.
  - Rows per page: 10/25/50/100.
  - Right: `Tandai Semua sebagai Terbaca`.

## UI Interaction Requirements - Filter Panel
- Trigger: Filter icon.
- Date: `Mulai Dari`, `Sampai Dengan`.
- Status: `Semua`, `Terbaca`, `Belum Terbaca`.
- Buttons: `Tutup`, `Reset`, `Terapkan`.

## UI Interaction Requirements - States
- Empty: `Belum ada notifikasi`.
- Pagination controls.

## Data Behaviour Requirements
- User-specific (Staff Toko only).
- Click message → detail modal/view.
- Unread bold/highlighted.

## Security / Business Rules
- View own notifications only.
- Soft delete.

## Acceptance Criteria
1. Table shows notifications with read status indicators.
2. Filters update list (date/status).
3. Unread rows bold; count in bell badge.

---

## TITLE
**FR-051 Notifikasi - FR051.2 Mark Read/Unread and Delete**

## Description
Interact with notifications: mark read, bulk read all, delete single/bulk.

## UI Interaction Requirements
- Row click: Auto-mark read, open detail.
- 3-dot: `Tandai Terbaca` / `Tandai Belum Dibaca` / `Hapus` (confirm).
- Bulk: Checkbox select → toolbar actions (read all, delete selected).
- `Tandai Semua sebagai Terbaca`: Marks all visible unread.

## Data Behaviour Requirements
- Mark read: Update status, reduce unread count.
- Delete: Soft delete (hide from list).
- Bulk: Process selected rows.

## Security / Business Rules
- Confirmation for delete/bulk.

## Acceptance Criteria
1. Actions update status instantly.
2. Bulk checkbox + actions work.
3. Unread count decreases.

---

## TITLE
**FR-051 Notifikasi - FR051.3 Search and Pagination**

## Description
Search, filter, and paginate notifications.

## UI Interaction Requirements
- Search: Real-time by message/content.
- Pagination: Standard controls.

## Data Behaviour Requirements
- Combined filters: Date + status + search.

## Security / Business Rules
N/A

## Acceptance Criteria
1. Search narrows results.
2. Pagination maintains filters.