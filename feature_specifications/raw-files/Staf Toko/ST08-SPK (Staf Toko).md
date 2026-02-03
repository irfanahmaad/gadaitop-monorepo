For Store Staff, the SPK feature covers listing SPK for their store, creating new SPK (pawn contracts), viewing details, and confirming transactions with the customer’s PIN.
​

FR‑198 View SPK List (Store Staff)
Feature Name: View SPK List (Store Staff)

Description: The system displays a list of SPK for the Store Staff’s own store.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The SPK page shows a table with customer photo, SPK Number, Customer Name, SPK Amount, Remaining SPK, and Date & Time, matching the design.

Only SPK belonging to the Store Staff’s assigned store are listed; other stores’ SPK are not visible.

The table supports pagination and simple filtering (e.g., by SPK number or date) via the Filter panel.

FR‑199 Create New SPK (Pawn Contract)
Feature Name: Create SPK

Description: Store Staff can create a new pawn contract based on customer and item data.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The “Tambah Data” form allows selection or creation of a customer (integrated with Scan KTP / Master Customer) and captures contract fields such as Catalog Item, Appraised Value, Loan Amount (SPK), Tenor, Interest, and other required details.

The system calculates derived values (e.g., maximum allowable loan based on “Mata” terms) and validates that entered loan amounts are within configured limits.
​

On Save, a new SPK record is created in status “Active” (or equivalent), visible in the SPK list and linked to the customer and items.

FR‑200 Upload Item Evidence & Save Draft
Feature Name: Attach Item Evidence to SPK

Description: Store Staff can attach photos and notes describing the pawned item before finalizing the SPK.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

The SPK form supports uploading multiple evidence photos and entering item condition notes; uploaded files show as thumbnails beneath the form.

Store Staff can save the SPK as Draft if required information (e.g., photos) is not yet complete, and return later to edit and finalize.

Draft and Active SPK states are clearly indicated in the SPK list and detail views.

FR‑201 View SPK Detail & NKB List (Store Staff)
Feature Name: View SPK Detail with NKB History

Description: Store Staff can open SPK detail to see full contract info and related NKB (payments/renewals).

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

The SPK detail page shows customer profile, SPK summary (amount, remaining SPK, dates), and a “Daftar NKB” table listing all NKB related to the SPK, similar to the Admin PT view but scoped to the store.

NKB table includes columns for NKB Number, Amount Paid, Type (Renewal/Redemption), Date & Time, Status, and Actions.

Store Staff can navigate from NKB rows to NKB detail screens according to the NKB feature design.

FR‑202 Customer PIN Confirmation for SPK
Feature Name: Confirm SPK with Customer PIN

Description: Before an SPK becomes effective, the customer must enter their PIN as a digital confirmation.

Actor: Store Staff, Customer

Priority: High

Acceptance Criteria:

When Store Staff completes an SPK and clicks “Finalize” (or equivalent), the system shows a modal prompting the customer to enter their PIN on-screen.

The PIN is securely validated against the customer’s stored PIN; on success, the SPK status changes to Active and a success dialog is displayed, while on failure an error appears and the SPK remains pending.
​

Incorrect PIN attempts are limited; exceeding the limit may require staff or Admin PT intervention according to security policy.