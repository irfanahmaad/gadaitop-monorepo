FR‑160 View Customer Master List
Feature Name: View Customer Master List

Description: The system displays a master list of customers for branches under the Admin PT’s PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Master Customer” page shows a table with columns such as Photo, Customer Name, NIK, City, Address, and Actions, matching the design.

A branch selector at the top limits the list to customers associated with the selected branch; Admin PT can only see branches within their PT.
​

The table supports pagination and simple search (e.g., by name or NIK) to quickly locate a customer.

FR‑161 View Customer Detail & Contact Information
Feature Name: View Customer Detail

Description: Admin PT can open a full customer profile containing identity and contact information.

Actor: Admin PT

Priority: High

Acceptance Criteria:

Selecting a customer opens a detail page with sections like “Data Customer” (name, NIK, gender, birth date/place) and “Detail Contact” (city, district, address, phone numbers, email).

All fields are read-only on this screen unless a separate edit flow is defined; values come from the centralized customer master record.
​

Breadcrumbs clearly indicate navigation from Master Customer list to the specific customer detail.

FR‑162 View Customer SPK List from Master Customer
Feature Name: View Customer SPK History

Description: The customer detail page includes a table of SPK associated with that customer.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The “Daftar SPK” table shows columns such as SPK Number, Customer Name, SPK Amount, Remaining SPK, SPK Date & Time, and Action, filtered to the selected customer only.

The table is paginated and sorted by SPK Date & Time descending, allowing Admin PT to review the customer’s loan history.
​

Clicking an SPK row or action opens the corresponding SPK Detail page while preserving the context of the current customer.

FR‑163 Change Customer PIN (Admin PT)
Feature Name: Change Customer PIN

Description: Admin PT can change or reset a customer’s PIN used to access the customer-facing application, with confirmation dialogs.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The customer detail page provides a “Change PIN” button that opens a form with fields “New PIN” and “Confirm PIN”; both fields require the same value and must comply with the configured PIN rules (length, numeric only, etc.).
​

Submitting a valid PIN shows a confirmation dialog (“Are you sure?”); confirming updates the PIN and then shows a success dialog indicating the change is effective.

PIN values are never shown in clear text after saving and are stored and transmitted according to the system’s security and encryption standards.
​

FR‑164 Access Control & Data Quality for Master Customer
Feature Name: Master Customer Access & Data Quality

Description: Access to customer master data is restricted and changes are audited to maintain data quality.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

Only users with appropriate Admin PT permissions can view customer details or change customer PINs; other roles are denied or redirected according to RBAC rules.
​

For each customer record, the system logs who created/updated it and when, including PIN change events, to support audits and compliance.

Customer master data shown in this module is treated as the authoritative source and is synchronized with other systems (e.g., SPK, reporting) to avoid inconsistencies.
​