# FR-044 Scan KTP Staff Toko

## TITLE
**FR-044 Scan KTP Staff Toko** - Feature Name

## Description
Scan KTP feature allows Staff Toko to search for existing customer data via OCR on KTP image upload or manual NIK input. If customer found, redirect to customer detail; if not found, show popup to close or register new customer (redirect to Master Customer "Tambah Data").

## Actor
- Staff Toko

## Priority
High

## Preconditions
1. User logged in as Staff Toko.
2. Access to camera/file upload for KTP scan.

## Postconditions
1. OCR extracts NIK; searches Master Customer database.
2. Existing customer: Redirect to detail view.
3. New customer: Popup offers "Daftarkan Customer Baru" → redirect to Add Customer form.

---

## TITLE
**FR-044 Scan KTP Staff Toko - FR044.1 View Scan KTP Page**

## Description
Display Scan KTP interface with OCR upload, manual NIK input, and scan options.

## UI Interaction Requirements - Page Header
- Breadcrumb: GADAI TOP > Scan KTP.
- Page title: "Scan KTP".

## UI Interaction Requirements - Main Form
- NIK input field (auto-populated from OCR).
- Primary buttons: "Scan" (red), "Reset".
- Right sidebar: Instructions/help text.

## UI Interaction Requirements - Scanner Modal
- Modal with camera preview for live scan or file upload.
- "Scan OCR" button.
- Bottom preview: Customer hand holding KTP with scan frame.
- Close button (X).

## Data Behaviour Requirements
- OCR processes KTP image to extract NIK.
- Customer data integrated across PTs.

## Security Business Rules
- Role-based access: Staff Toko only.
- No hard delete; audit trail for scans.

## Acceptance Criteria
1. Page matches Figma layout (sidebar, form, modal).
2. Reset clears NIK field and modal.

---

## TITLE
**FR-044 Scan KTP Staff Toko - FR044.2 Perform OCR Scan**

## Description
Capture and process KTP image via OCR to extract NIK and search customer.

## UI Interaction Requirements
- "Scan" button opens modal with camera/upload.
- Live preview with scan frame.
- Post-scan: Populate NIK field, process search.

## Data Behaviour Requirements
- Extract NIK from KTP image.
- Search Master Customer by NIK.

## Security Business Rules
- Secure image upload/processing.

## Acceptance Criteria
1. OCR successfully extracts NIK from KTP image.
2. Manual NIK input also triggers search.

---

## TITLE
**FR-044 Scan KTP Staff Toko - FR044.3 Handle Search Results**

## Description
Based on search, redirect or show popup for new registration.

## UI Interaction Requirements
- Success (found): Auto-redirect to customer detail.
- Not found: Popup with "Tutup" or "Daftarkan Customer Baru" buttons.
- Blacklist check: Label if blacklisted (blocks SPK).

## Data Behaviour Requirements
- If NIK exists: Load full customer data (Nama, Alamat, Kota, Kecamatan, Kelurahan, Telepon 1/2, No KTP, Tanggal Lahir, Email, NIK).
- If new: Redirect to Master Customer > Tambah Data.
- Blacklisted customers labeled; cannot create SPK.

## Security Business Rules
- Cross-PT data visibility allowed.

## Acceptance Criteria
1. Existing NIK redirects to detail page.
2. Non-existing shows popup; "Daftarkan" redirects to Add form.
3. Blacklisted customer shows label.
