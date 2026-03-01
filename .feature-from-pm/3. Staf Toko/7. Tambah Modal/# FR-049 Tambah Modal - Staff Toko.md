# FR-049 Tambah Modal - Staff Toko

## TITLE
**FR-049 Tambah Modal - Staff Toko** - Feature Name

## Description
Tambah Modal feature enables Staff Toko to request additional funds from Admin PT when branch cash is low for daily operations/pawning. Flow: Staff creates request → routed to Admin PT → Admin transfers manually + uploads proof → Staff receives notification/confirmation.

## Actor
- Staff Toko (requester)

## Priority
Medium

## Preconditions
1. User logged in as Staff Toko.
2. No open requests for current toko (TBD validation).

## Postconditions
1. Request created and notified to Admin PT.
2. Admin approves/uploads proof → Staff notified.
3. Request status: Pending → Approved → Confirmed.

---

## TITLE
**FR-049 Tambah Modal - FR049.1 View Tambah Modal List**

## Description
Paginated table of capital addition requests with status and actions.

## UI Interaction Requirements - Page Header
- Page title: `Tambah Modal`.
- Breadcrumb: GADAI TOP > Tambah Modal.

## UI Interaction Requirements - Table
- Columns (from Figma):
  - Request date / ID.
  - Nominal amount.
  - Status: Pending (orange), Approved (green), Rejected (red).
  - Proof attachment (if approved).
  - Actions: Detail, Edit (if pending), Delete.
- Toolbar:
  - Filter: Date range `Mulai Dari` to `Sampai Dengan`, Status.
  - Buttons: `Tutup`, `Reset`, `Terapkan`.
  - Search.
  - `Permintaan Baru` button (primary red).

## UI Interaction Requirements - States
- Empty: "Belum ada permintaan tambah modal".

## Data Behaviour Requirements
- List shows requests for current toko.
- Status updates via Admin PT actions.

## Security / Business Rules
- Staff views/edits only own toko requests.
- Link to mutasi on approval.

## Acceptance Criteria
1. Table shows requests with status colors.
2. Filters apply correctly.

---

## TITLE
**FR-049 Tambah Modal - FR049.2 Create New Request (Permintaan Baru)**

## Description
Staff submits new capital request form.

## UI Interaction Requirements - Modal/Form
- Click `Permintaan Baru` → modal:
  - `Nominal` (numeric input, Rp format).
  - `Keterangan` (textarea, reason for request).
  - Buttons: `Batal`, `Kirim Permintaan` (red).
- Validation: Nominal >0, required fields.

## Data Behaviour Requirements
- Create request record linked to toko.
- Auto-notify Admin PT (dashboard/email).
- Status: Pending.

## Security / Business Rules
- Limit concurrent requests per toko (TBD).

## Acceptance Criteria
1. Form submits and shows in list as Pending.
2. Admin PT notified.

---

## TITLE
**FR-049 Tambah Modal - FR049.3 Receive and Confirm Approval**

## Description
Staff views Admin PT proof upload and confirms receipt.

## UI Interaction Requirements - Detail Modal
- Click row → detail:
  - Request info: Nominal, date, keterangan.
  - Admin actions: Transfer proof image (uploaded by Admin).
  - Status badge.
  - If approved: `Konfirmasi Diterima` button.
- Success: Green modal `✅ Modal diterima`.

## Data Behaviour Requirements
- Admin uploads proof → status Approved, notify Staff.
- Staff confirm → status Confirmed, post to mutasi (cabang Credit).

## Security / Business Rules
- Manual transfer verification.
- Audit proof upload/confirmation.

## Acceptance Criteria
1. Proof visible on approval.
2. Staff confirmation finalizes and updates mutasi.

---

## TITLE
**FR-049 Tambah Modal - FR049.4 Edit/Cancel Request**

## Description
Edit pending requests or cancel.

## UI Interaction Requirements
- Pending row: `Edit` → pre-fill form.
- `Hapus` → confirmation modal.

## Data Behaviour Requirements
- Edit updates pending request, re-notify Admin.
- Cancel: Soft delete, notify Admin.

## Security / Business Rules
- Only editable if Pending.

## Acceptance Criteria
1. Edit saves changes.
2. Cancel removes from list.
