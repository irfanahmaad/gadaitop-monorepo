# FR-046 NKB Management - Staff Toko

## TITLE
**FR-046 NKB Management - Staff Toko** - Feature Name

## Description
The NKB page allows Staff Toko to manage payment transactions against SPK records via two tabs: "NKB Baru" (today's pending payments) and "History NKB" (past payments). Staff processes cash payments from customers, confirms receipt, and updates SPK status. System handles automatic calculations for interest, penalties, and unique NKB numbering. Checkbox in table is used exclusively for bulk selection and bulk deletion.

## Actor
- Staff Toko

## Priority
High

## Preconditions
1. User logged in as Staff Toko.
2. SPK exists and is eligible for payment (not fully lunas).
3. Customer payment initiated via Customer Portal (NIK + PIN → SPK selection → type: Pelunasan/Perpanjangan → mandiri/cash).

## Postconditions
1. Cash payment confirmed by Staff Toko.
2. NKB record created with calculations.
3. SPK status updated (Lunas/Berjalan/Terlambat).

---

## TITLE
**FR-046 NKB Management - FR046.1 View NKB List and Tabs**

## Description
Display NKB list with tabs separating new (today) and historical payments.

## UI Interaction Requirements - Page Header
- Page title: `NKB`.
- Breadcrumb: GADAI TOP > NKB.
- Tabs: `NKB Baru` (active by default), `History NKB`.

## UI Interaction Requirements - Table (NKB Baru Tab)
- Table columns (from Figma):
  - **Checkbox** (first column): Used only for bulk selection.
  - SPK number.
  - Customer details (name/NIK).
  - Amount due (`Nominal`).
  - Due date / status.
  - Action buttons (e.g., `Konfirmasi` red button).
- Toolbar:
  - Bulk action button: `Hapus Terpilih` (enabled when checkboxes selected) for bulk deletion.
  - Filter panel (date range `Mulai Dari` to `Sampai Dengan`, status dropdown).
  - Buttons: `Tutup`, `Reset`, `Terapkan`.
  - Search input.
  - Pagination (rows per page selector).
- Empty state: "Belum ada NKB baru hari ini".

## UI Interaction Requirements - Table (History NKB Tab)
- Similar table structure but shows past confirmed NKB.
- **Checkbox**: Used only for bulk selection and bulk deletion.
- Additional columns: Payment date, NKB number, confirmation status.
- Bulk delete available for historical records.

## Data Behaviour Requirements
- `NKB Baru`: Filter to pending cash payments from today (generated via Customer Portal).
- `History NKB`: All previous NKB records (confirmed).
- Bulk deletion: Soft delete selected NKB records (update status, retain audit trail).
- Auto-refresh for new pending payments.

## Security / Business Rules
- Staff Toko sees only NKB for their assigned toko.
- Role-based access to confirm only.
- Bulk delete requires confirmation dialog and audit logging.

## Acceptance Criteria
1. "NKB Baru" shows only today's pending cash payments.
2. "History NKB" shows all past payments with details.
3. Checkbox selects rows for bulk delete only; `Hapus Terpilih` processes selected items.
4. Bulk delete confirmation dialog appears before execution.
5. Tab switch maintains filters/pagination state.

---

## TITLE
**FR-046 NKB Management - FR046.2 Process Cash Payment Confirmation**

## Description
Staff Toko scans SPK barcode to load details, selects payment type, reviews auto-calculated amounts, and confirms cash receipt.

## UI Interaction Requirements
- Click row or `Konfirmasi` button → modal opens:
  - Scan SPK barcode input (camera/QR scanner).
  - SPK details: Customer, item, due date, status.
  - Payment type selector: `Pelunasan` or `Perpanjangan`.
  - Auto-calculated breakdown:
    - Pokok pinjaman.
    - Bunga (based on days late).
    - Denda (if late).
    - Admin fee, insurance.
    - Total due.
  - Cash confirmation checkbox / button: `Uang cash sudah diterima`.
  - Buttons: `Konfirmasi Pembayaran`, `Batal`.

## Data Behaviour Requirements
- Barcode scan loads SPK details.
- Calculate based on:
  - Start date (pinjaman), due date, current date.
  - Defaults: x=5% (early), y=10% (normal), adm=0%, as=0, d=2%.
  - Min pokok angsuran: Rp50,000.
  - Late >1 month: multiply d% by months.
- Generate NKB number: `[KodeLokasi]-NKB-YYYYMMDD-####` (unique globally).

## Security / Business Rules
- Cash confirmation requires Staff Toko explicit action.
- Update SPK status: Lunas (full pokok), Berjalan (perpanjangan), Terlambat (if overdue).
- Log all changes for audit.

## Acceptance Criteria
1. Scan barcode loads correct SPK with auto-calculated totals.
2. Payment type selection updates calculations correctly (e.g., late penalty).
3. Confirmation creates NKB and updates SPK status.

---

## TITLE
**FR-046 NKB Management - FR046.3 Customer Portal Integration (Read-Only View)**

## Description
NKB list reflects payments initiated via separate Customer Portal; Staff views/handles cash ones.

## UI Interaction Requirements
- NKB Baru shows portal-generated pending cash requests.
- No direct edit; only confirmation.

## Data Behaviour Requirements
- Customer flow (reference):
  - Portal: NIK + PIN → SPK list → select → Pelunasan/Perpanjangan → mandiri (auto-confirm via gateway) or cash (pending for Staff).
- Mandiri payments auto-create NKB and update SPK (Staff sees in History).
- Cash pending appear in NKB Baru for manual confirmation.

## Security / Business Rules
- Global NKB uniqueness across locations.
- Portal payments auto-update; cash requires Staff confirmation.

## Acceptance Criteria
1. Cash requests from portal appear in NKB Baru.
2. Confirmed cash NKB moves to History NKB.
3. Mandiri payments visible only in History (auto-processed).

---

## TITLE
**FR-046 NKB Management - FR046.4 NKB Numbering and SPK Status Updates**

## Description
Auto-generate unique NKB numbers and update SPK status post-payment.

## UI Interaction Requirements
- Post-confirmation: Success modal shows new NKB number.
- Refresh table; row moves to History.

## Data Behaviour Requirements
- NKB format: `[KodeLokasi]-NKB-YYYYMMDD-4Random` (no duplicates).
- SPK status logic:
  | Condition | Status |
  |-----------|--------|
  | Pokok fully paid | Lunas |
  | Only interest paid | Berjalan |
  | Overdue & partial | Terlambat |

## Security / Business Rules
- Sequence/random ensures global uniqueness.
- Partial pokok payments reduce remaining principal.

## Acceptance Criteria
1. NKB number follows exact format and is unique.
2. SPK status updates correctly based on payment type/amount.
