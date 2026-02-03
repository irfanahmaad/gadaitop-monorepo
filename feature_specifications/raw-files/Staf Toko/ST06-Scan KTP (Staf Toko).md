FR‑194 Search Customer by NIK (Scan KTP Screen)
Feature Name: Search Customer by NIK

Description: Store Staff can enter a NIK to check whether the customer already exists in the system before onboarding.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The “Scan KTP” page provides a “Cari SPK / NIK” input where Store Staff can type or paste the NIK and click “Cari”.

If a matching customer is found, the system retrieves and displays the customer’s basic information or routes to the relevant customer/SPK detail screen.

If no data is found, a “No Data” dialog appears explaining that no matching record exists and offering an option to proceed with new customer registration.

FR‑195 Capture KTP Image for OCR
Feature Name: Capture KTP Image

Description: When no existing record is found, Store Staff can capture a photo of the customer’s KTP for OCR processing.

Actor: Store Staff

Priority: High

Acceptance Criteria:

Selecting “Daftarkan” (or equivalent) from the “No Data” dialog opens an OCR capture modal with a live camera frame or upload area indicating where the KTP should be placed, as shown in the design.

The system accepts images from the device camera or file upload (depending on platform capabilities) and validates basic quality criteria such as file type and maximum size.
​

Staff can cancel the capture and return to the search screen by clicking “Tutup”.

FR‑196 Extract KTP Data via OCR
Feature Name: OCR Extraction from KTP

Description: The system uses OCR to read key identity fields from the captured KTP image and prepare them for customer registration.

Actor: Store Staff

Priority: High

Acceptance Criteria:

After a KTP image is captured, the system sends it to the OCR service and extracts at least: NIK, full name, date of birth, address, and gender, according to supported KTP formats.
​

If OCR confidence is high and data is valid, the extracted values are populated into the new customer registration form for Store Staff to review and confirm, reducing manual typing.

If OCR fails or confidence is low, the system notifies the staff and allows manual data entry using the captured image as a visual reference.

FR‑197 Privacy & Compliance for KTP Scanning
Feature Name: KTP Scan Privacy & Compliance

Description: KTP scanning and OCR must comply with applicable privacy and eKYC regulations.

Actor: Store Staff, System

Priority: High

Acceptance Criteria:

KTP images and extracted data are transmitted over secure channels (HTTPS) and stored according to the organization’s data-retention and encryption policies.
​

Access to Scan KTP and OCR results is limited to authorized roles (e.g., Store Staff, Admin PT) in the same PT and store; all scan events are logged with timestamp, staff ID, and result.

The system provides a way to delete or anonymize KTP images once they are no longer needed, following internal and regulatory data‑handling requirements.