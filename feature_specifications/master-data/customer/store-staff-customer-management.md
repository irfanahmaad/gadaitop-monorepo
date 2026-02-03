FR‑208 View Customer List (Store Staff)
Feature Name: View Store Customer List

Description: The Master Customer page shows customers relevant to the Store Staff’s store for operational use.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The list displays columns such as Photo, Customer Name, NIK, City, Address, and Actions, similar to the Admin PT view but restricted to customers created or served at the Store Staff’s store (or PT-level scope defined by policy).
​

Search and basic filters (e.g., by NIK or name) allow Store Staff to quickly find a customer prior to creating SPK or processing NKB.

Store Staff have read access to all fields but write/create access only as allowed by their role (see below).

FR‑209 Create New Customer (Store Staff)
Feature Name: Create Customer from Branch

Description: Store Staff can create new customers directly from the Master Customer menu using data entry or KTP OCR.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The “Tambah Data” form includes identity fields (NIK, full name, date/place of birth, gender), contact details (address, city, phone, email), and the initial customer PIN field.

Store Staff can optionally open a Scan OCR modal from this form to capture KTP and auto-fill fields, consistent with the Scan KTP feature.
​

On Save, the system validates uniqueness of NIK and required fields; if NIK already exists globally, the system warns the staff and prevents duplicate creation according to master data rules.
​

FR‑210 Customer PIN Setup and Change (Store Staff)
Feature Name: Manage Customer PIN (Branch)

Description: Store Staff can set the initial PIN during customer creation and later assist the customer in changing the PIN when necessary.

Actor: Store Staff, Customer

Priority: High

Acceptance Criteria:

During creation, the form includes a PIN field (with strength/length rules); PIN input is masked and must be confirmed by re-entry before saving.

From the customer detail page, Store Staff can open a “Masukkan PIN” dialog to change the PIN, following verification procedures (e.g., checking ID, asking security questions) as defined by business policy.
​

PINs are stored and transmitted securely, and only limited roles (e.g., Store Staff, Admin PT) can initiate PIN changes; actual PIN values are never displayed in plain text.

FR‑211 View Customer Detail & SPK List (Store Staff)
Feature Name: View Customer Detail & SPK at Store

Description: Store Staff can open a customer detail page to view profile and related SPK issued at their store.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

The detail page shows “Data Customer” (identity and contact info) and a “Daftar SPK” table listing SPK linked to that customer, filtered to the staff’s store unless cross-store viewing is allowed.

Store Staff can navigate from each SPK row directly to SPK detail for further actions (renewal, redemption, etc.).

Edits to customer master data from this screen are limited according to role permissions (e.g., Store Staff may edit contact fields but not core identity fields if governed centrally).
​

FR‑212 Access Control & Data Governance for Store Customer Data
Feature Name: Store Customer Data Permissions

Description: Access to create or modify customer records from the branch is controlled to protect data quality and compliance.

Actor: Store Staff, Admin PT

Priority: Medium

Acceptance Criteria:

Role-based permissions specify which fields Store Staff can Create, Read, Update, or not touch at all (for example, they may create new customers and edit contact details, but only Admin PT can modify NIK or delete customers).
​

All create/edit/PIN-change actions performed by Store Staff are logged with user ID, timestamp, and before/after values as appropriate.

Customer master data created at branches is synchronized with PT-level master data so that Admin PT sees a consistent, authoritative record for each customer.
