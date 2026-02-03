FR‑165 View Store Master List
Feature Name: View Store Master List

Description: The system displays a master list of all stores/branches under the Admin PT’s PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Master Toko” page shows a table with columns such as Store Code, Store Name, Alias, City, Address, and Actions, matching the design.

Admin PT sees only stores belonging to their PT; the list supports pagination and simple search by name or code.
​

Clicking a row or Detail action opens the store detail view.

FR‑166 Create New Store
Feature Name: Create Store (Branch)

Description: Admin PT can create a new store/branch record via the “Tambah Data” form.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The add-store form includes fields such as Store Code/ID, Store Name, Alias, PT/Company, Region/City, Full Address, Phone Number, and optional notes.

Required fields are validated; duplicate Store Codes or missing mandatory data are rejected with clear error messages.
​

On successful save, the new store appears in the Master Toko list and any confirmation dialog shows success.

FR‑167 View Store Detail
Feature Name: View Store Detail

Description: The system provides a detailed view of a specific store, including identification and address data.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The detail screen shows key fields such as Store Name, Code, Alias, PT, address breakdown (city, district, sub‑district), contact numbers, and status (Active/Inactive).

Data is read‑only on this screen unless the Edit action is triggered; values are sourced from the store master record.
​

Breadcrumbs reflect navigation from Master Toko list to the selected store detail.

FR‑168 Edit Store Data
Feature Name: Edit Store Data

Description: Admin PT can update store information when details change.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

From the store detail or list, an Edit action opens a form pre‑filled with the current store data (same fields as the create form).

Saving changes requires confirmation and then updates the store record; success and error dialogs provide feedback.
​

Certain critical identifiers (e.g., Store Code) may be locked from editing depending on business rules; attempting to change locked fields is prevented.

FR‑169 Deactivate / Activate Store
Feature Name: Deactivate or Activate Store

Description: Admin PT can deactivate a store that is no longer operating and reactivate it if needed.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The Actions menu includes options such as “Deactivate Store” and (for inactive stores) “Activate Store”; selecting one opens a confirmation dialog.

Confirming Deactivate sets the store status to Inactive so it is excluded from operational selections (e.g., new SPK, Setor Uang) while keeping historical data intact.
​

Reactivating a store sets its status back to Active and makes it available again in other modules, with all status changes logged in an audit trail.