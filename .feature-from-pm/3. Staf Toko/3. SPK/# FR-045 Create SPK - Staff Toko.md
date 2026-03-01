# FR-045 Create SPK - Staff Toko

## TITLE
**FR-045 Create SPK - Staff Toko** - Feature Name

## Description
Staff Toko uses the SPK page to register a new pawn transaction for a customer by searching the customer using NIK/name, then filling in pawn item details and loan amount. The system automatically generates internal and customer-facing SPK numbers and links them to the customer, item, and future payment (NKB) processes.

## Actor
- Staff Toko

## Priority
High

## Preconditions
1. User is logged in as Staff Toko.
2. Customer data already exists or will be created via Master Customer / Scan KTP.
3. Master Katalog and Item Type data are available.
4. Customer is not blacklisted (or system blocks SPK creation if blacklisted).

## Postconditions
1. New SPK record is created and stored.
2. Internal SPK number and customer SPK number are generated and unique.
3. SPK is linked to customer, item, and branch (toko).
4. Internal SPK QR Code is generated and printable.

---

## TITLE
**FR-045 Create SPK - FR045.1 Search Customer**

## Description
Allow Staff Toko to search and select a customer by NIK or name before creating an SPK.

## UI Interaction Requirements
- Page title: `SPK`.
- Section: `Daftar SPK` with table of existing SPK and button `Tambah SPK`.
- On clicking `Tambah SPK`, system opens `Tambah Data` SPK form with:
  - Customer search field:
    - Search by NIK.
    - Search by customer name (autocomplete / dropdown).
  - Display selected customer summary (photo/avatar, name, NIK, phone, address).
- Filter panel on list view:
  - Fields (from Figma): Date range, Status, and other filters (TBD exact labels).
  - Button `Terapkan` to apply filters and refresh table.

## Data Behaviour Requirements
- Search by NIK returns matching customer record across PTs.
- Search by name returns list of matches; Staff Toko selects one.
- If no customer found, Staff Toko can navigate to Master Customer > Tambah Data (or via Scan KTP flow).

## Security / Business Rules
- Staff Toko can only see customers allowed by business rules (cross-PT visibility as defined in RS).
- Blacklisted customers must be clearly indicated; SPK creation should be blocked or require specific handling (TBD).

## Acceptance Criteria
1. Staff Toko can find customer by NIK or name and select exactly one customer.
2. Selected customer data is displayed on the SPK form header.
3. If customer not found, system provides navigation to create a new customer.

---

## TITLE
**FR-045 Create SPK - FR045.2 Input Pawn Item and Loan Data**

## Description
Capture detailed information about the pawned item and requested loan amount for the SPK.

## UI Interaction Requirements - Form Fields
The `Tambah Data` SPK form includes the following key fields:

- Reference price data:
  - `Data harga acuan` (read-only) from Master Katalog, based on selected item and date.
- Item attributes:
  - `Tipe barang` (dropdown from Master Tipe Barang).
  - `Kondisi barang` (options: `Mulus`, `Lecet sedikit`, `Lecet parah`).
  - `Kelengkapan barang` (free text / checklist as per Figma).
  - `Status barang` (dropdown; e.g., `Normal`, `Khusus` – exact options TBD from Figma).
- Loan details:
  - `Jumlah Pinjaman` (numeric input).
- IMEI:
  - Input field for IMEI.
  - Option to scan IMEI (e.g., barcode/QR) or type manually.
  - Label/indicator showing whether value is from **scan** or **manual input**.
- Additional info:
  - `Keterangan tambahan` (multiline text).
- Action buttons:
  - `Batal` / `Kembali` (cancel).
  - `Simpan Draft` (if available in Figma, TBD).
  - `Simpan` / `Submit` to create SPK.

## Data Behaviour Requirements
- Reference price must be loaded from Master Katalog based on selected item and effective date.
- `Jumlah Pinjaman` cannot exceed reference price value.
- IMEI field accepts scanned or manually typed value; system stores source type (scan/manual).
- All mandatory fields must be validated before SPK creation.
- Item and loan data are stored as part of the SPK record.

## Security / Business Rules
- Validation rule: `Jumlah Pinjaman` ≤ `Harga acuan` from Master Katalog.
- Only Staff Toko with access to the current toko may create SPK in that toko.
- No hard delete: SPK records cannot be permanently removed (only soft-delete or status change).

## Acceptance Criteria
1. Staff Toko can fill all required fields and submit without validation errors when data is complete and valid.
2. Attempting to enter `Jumlah Pinjaman` greater than the reference price shows a validation error and blocks submission.
3. IMEI field correctly records whether the value came from scan or manual entry.

---

## TITLE
**FR-045 Create SPK - FR045.3 Generate SPK Numbers and QR Code**

## Description
After successful submission, the system generates both internal and customer-facing SPK numbers and a QR Code for internal use.

## UI Interaction Requirements
- On submit, show loading state (overlay with spinner and message such as `Silakan tunggu...`).
- After success:
  - Show success popup (`Apakah Anda yakin?` confirmation may appear before final submit as per Figma).
  - Redirect to SPK detail page showing:
    - Page title: `[SPK Customer Number] - [Customer Name]`.
    - Section `Detail SPK` with:
      - Internal SPK number.
      - Customer SPK number.
      - Other item and loan details.
  - Provide option to print internal SPK with QR Code.

## Data Behaviour Requirements
- Internal SPK number format:
  - `[Tipe barang][Kode urutan transaksi 8 digit per toko]`.
  - Example: `H00000001`.
  - Sequence is unique per toko, but the same sequence may exist in other branches.
- Customer SPK number format:
  - `YYYYMMDD[4-digit random number]`.
  - Must be globally non-redundant (no duplicates across system).
- System generates a QR Code representing the internal SPK number.
- QR Code is stored/linked so it can be printed and attached to the pawned item.

## Security / Business Rules
- Internal SPK sequences are managed per toko to avoid conflicts.
- Random 4-digit part of customer SPK number must be checked to prevent duplication.
- All SPK number generations are logged (for audit trail).

## Acceptance Criteria
1. On successful SPK creation, both internal and customer SPK numbers are visible on the detail page.
2. Internal SPK numbers follow format `[ItemType][8-digit sequence]`.
3. Customer SPK numbers follow format `YYYYMMDD####` and are unique.
4. QR Code is generated and can be printed from the SPK detail page.

---

## TITLE
**FR-045 Create SPK - FR045.4 Customer PIN Creation and Confirmation**

## Description
During SPK creation, the customer must provide a PIN on a separate customer portal interface, which will be used later for payment and redemption.

## UI Interaction Requirements
- After Staff Toko completes the SPK form and submits:
  - If customer does not yet have a PIN:
    - System prompts Staff Toko to ask customer to create a PIN.
    - Second screen (customer-facing, portal customer) shows:
      - Information: customer name and brief instructions.
      - Fields: `PIN` and `Confirm PIN`.
      - Button: `Simpan` / `Submit PIN`.
  - If customer already has a PIN:
    - Screen offers options:
      - Use existing PIN.
      - Create new PIN (will replace old one).
- Staff Toko screen shows waiting state until customer finishes PIN input (`Silakan tunggu` overlay).

## Data Behaviour Requirements
- PIN Customer is stored one-to-one with Customer record (only 1 active PIN per customer).
- When customer chooses “create new PIN”, old PIN is invalidated and replaced.
- SPK creation is only fully completed once the PIN flow is finished (new PIN set or existing PIN confirmed to be used).
- PIN will be required later for:
  - Payment (via NKB portal).
  - Redemption of pawned item.

## Security / Business Rules
- Only the customer can input the PIN on the customer-facing interface; Staff Toko must not see the actual PIN value.
- PIN must be securely stored (e.g., hashed) and never displayed in plain text.
- PIN length and complexity rules (TBD; e.g., minimum digits) must be validated.
- Audit log records that PIN was created/updated (without storing PIN itself).

## Acceptance Criteria
1. If customer has no PIN, system forces the PIN creation step before SPK is finalized.
2. If customer has an existing PIN, customer can choose to reuse or replace it.
3. Staff Toko cannot see the PIN; only sees status that PIN setup is completed.
4. After PIN step finishes, SPK detail page is displayed and SPK status is active.

