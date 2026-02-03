FR‑217 View Request Tambah Modal List
Feature Name: View Capital Top-Up Requests

Description: The Tambah Modal page shows all additional capital requests submitted by the Store Staff’s store.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The table lists Request Date & Time, Requested By, Store Name, Alias, Amount, Status (Pending, Approved/Disetujui, Rejected/Ditolak), and Actions, matching the design.

Only requests created for the Store Staff’s store are visible; statuses update as Admin PT processes them.

The list supports pagination and may offer simple filters (e.g., by status or date).

FR‑218 Create New Request Tambah Modal
Feature Name: Create Capital Top-Up Request

Description: Store Staff can submit a new request to increase the store’s operational cash balance.

Actor: Store Staff

Priority: High

Acceptance Criteria:

Clicking “Tambah Data” opens a “Request Tambah Modal” form where the staff enters the requested nominal amount; the system may display current balance or limits as reference.

On Save, a confirmation dialog appears; after confirmation the request is stored with status Pending and visible in the list for that store.

Validation ensures the requested amount is positive and within any configured maximum per request or per period, according to PT policy.
​

FR‑219 Edit or Cancel Pending Request Tambah Modal
Feature Name: Edit/Cancel Pending Top-Up Request

Description: While a request is still pending, Store Staff can correct the amount or cancel it entirely.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

Selecting a Pending request opens an “Edit Request Tambah Modal” form showing the current nominal value; staff can change it and save.

Cancelling or deleting a Pending request requires confirmation; once confirmed, the request status changes to Cancelled and is no longer actionable by approvers.

Approved or Rejected requests cannot be edited; their details remain read-only for audit.

FR‑220 Approval Handling & Status Feedback
Feature Name: Track Approval Result for Tambah Modal

Description: Store Staff see whether their Tambah Modal requests have been approved or rejected, along with any comments.

Actor: Store Staff, Approver (e.g., Admin PT / Finance)

Priority: Medium

Acceptance Criteria:

When an approver accepts a request, its status becomes Approved/Disetujui and a success dialog is displayed if the Store Staff is viewing the screen; rejected requests show Rejected/Ditolak with any reason captured by the approver.

Store Staff receive clear visual indicators (row colors, badges) of each request’s status so they know which funds can be expected and which have been declined.
​

Approved Tambah Modal amounts feed into the store’s cash planning and may trigger subsequent steps such as fund transfer or Setor Uang reversal, handled by other modules.

FR‑221 Audit & Control of Tambah Modal
Feature Name: Tambah Modal Audit & Limits

Description: All Tambah Modal activity is logged and constrained by governance rules to prevent misuse.

Actor: Store Staff, Admin PT

Priority: Medium

Acceptance Criteria:

Every request, edit, approval, rejection, and cancellation is logged with user, store, timestamp, and amounts to support reconciliation and internal controls.
​

System can enforce daily/weekly caps on total approved Tambah Modal per store, and generate alerts when thresholds are approached or exceeded.