# FR-048 Setor Uang - Staff Toko

## TITLE
**FR-048 Setor Uang - Staff Toko** - Feature Name

## Description
Setor Uang feature manages fund transfers from branch (Staff Toko) to central office via unique Virtual Account (VA). Staff Toko views pending requests from Admin PT, pays via VA on the same day, and system auto-verifies via payment gateway callback. Status updates: Pending → Lunas/Expired; auto-posts to mutasi ledgers.

## Actor
- Staff Toko (cabang)

## Priority
High

## Preconditions
1. User logged in as Staff Toko.
2. Pending request created by Admin PT with unique VA.
3. Notification received (dashboard).

## Postconditions
1. Payment completed via VA.
2. Callback confirms → status Lunas, mutasi updated.
3. One active pending per branch at a time.

---

## TITLE
**FR-048 Setor Uang - FR048.1 View Setor Uang List**

## Description
Paginated table of deposit requests with filters and status indicators.

## UI Interaction Requirements - Page Header
- Page title: `Setor Uang`.
- Breadcrumb: GADAI TOP > Setor Uang.

## UI Interaction Requirements - Table
- Columns (from Figma):
  - Request date / ID.
  - Nominal amount.
  - VA number (masked/click to copy).
  - Due date (same day).
  - Status: Pending (orange), Lunas (green), Expired (red).
  - Actions: Detail/View, Pay button (if pending).
- Toolbar:
  - Filter: Date range `Mulai Dari` to `Sampai Dengan`, Status dropdown.
  - Buttons: `Tutup`, `Reset`, `Terapkan`.
  - Search by ID/nominal.
  - Pagination.

## UI Interaction Requirements - States
- Empty: "Belum ada permintaan setor uang".
- Status badges/colors as per Figma.

## Data Behaviour Requirements
- List shows requests for current toko/cabang.
- Active pending: Max 1 per cabang.

## Security / Business Rules
- View only own branch requests.
- VA unique per request.

## Acceptance Criteria
1. Table shows pending requests with VA details.
2. Filters by date/status work.
3. Max 1 pending per cabang enforced.

---

## TITLE
**FR-048 Setor Uang - FR048.2 Process Payment Request**

## Description
Staff views request details, copies VA, pays externally, awaits auto-confirmation.

## UI Interaction Requirements - Detail Modal
- Click row → modal:
  - Request summary: Nominal, due date, VA number (large/copy button).
  - QR code for VA (bank app scan).
  - Instructions: "Bayar hari ini via bank app".
  - Status progress.
- Success modal post-callback: `✅ Lunas` with mutasi confirmation.

## Data Behaviour Requirements
- Staff pays VA externally (bank app).
- Gateway callback → verify amount/matches → update status Lunas.
- Auto-post: Cabang Debit, Pusat Kredit in mutasi.

## Security / Business Rules
- Payment same day only; overdue → Expired (VA invalid).
- Accept callbacks only from registered gateway endpoints.
- Prevent multiple active pendings per cabang.

## Acceptance Criteria
1. VA/QR easy to copy/scan.
2. Manual pay → callback → auto Lunas.
3. Overdue → Expired status.

---

## TITLE
**FR-048 Setor Uang - FR048.3 Status Updates and Mutasi Integration**

## Description
Auto-handle status changes and ledger postings.

## UI Interaction Requirements
- Real-time refresh on callback.
- Lunas row: Green badge, detail shows mutasi links.

## Data Behaviour Requirements
- Status flow:
  | From Admin PT | Staff Action | Callback | Status |
  |---------------|--------------|----------|--------|
  | Create req. | - | - | Pending |
  | - | Pay VA | Valid | Lunas |
  | - | - | Overdue/no pay | Expired |

- Mutasi: Auto Debit cabang, Credit pusat.

## Security / Business Rules
- Global uniqueness for VA/numbers.
- Audit all status changes.

## Acceptance Criteria
1. Callback updates status instantly.
2. Mutasi auto-posted on Lunas.
3. No duplicate pendings per cabang.
