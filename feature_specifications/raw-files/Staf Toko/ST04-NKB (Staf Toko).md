FR‑203 View New NKB List
Feature Name: View New NKB List

Description: The “NKB Baru” tab shows NKB records that are pending confirmation or recently created by Store Staff.

Actor: Store Staff

Priority: High

Acceptance Criteria:

If there are no pending NKB, the page shows an empty state with a message and “Reload” action as in the design.

When NKB exist, the table lists fields such as NKB Number, Payment Type (e.g., cash, transfer), Date & Time, Total Payment, Status, and Actions, for the Store Staff’s own store only.

The table supports pagination and optional filtering by date or payment type.

FR‑204 Confirm or Reject NKB Payment
Feature Name: Confirm/Reject NKB

Description: Store Staff can review NKB details and either confirm or reject the payment.

Actor: Store Staff

Priority: High

Acceptance Criteria:

Selecting an NKB from the list opens an “Informasi NKB” panel showing key details: NKB Number, linked SPK, Payment Type, Date & Time, and Total Payment.

Buttons such as “Setujui” and “Tolak” trigger a confirmation dialog (“Are you sure?”); confirming approval sets the NKB status to “Approved/Disetujui”, while rejecting sets it to “Rejected/Ditolak” with optional reason.

After confirmation, success dialogs are shown and the NKB moves to the History tab with its final status.
​

FR‑205 View NKB History
Feature Name: View NKB History

Description: The “History NKB” tab provides a historical list of all processed NKB for the store.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

The History table shows multiple NKB rows with columns such as NKB Number, Payment Type, Date & Time, Total Payment, Status (Approved/Rejected), and Actions, matching the design.

Only NKB belonging to SPK in the Store Staff’s store are displayed; other stores’ NKB are not visible.

Clicking a row opens a read-only “Informasi NKB” view showing all key details; the status cannot be changed once finalized.

FR‑206 SPK Balance Impact from NKB
Feature Name: Update SPK After NKB Payment

Description: Approved NKB payments update the corresponding SPK’s remaining balance and status.

Actor: Store Staff, System

Priority: High

Acceptance Criteria:

When an NKB is approved, the system applies the payment amount to the related SPK, reducing outstanding principal/interest or changing SPK status according to business rules (e.g., renewed, redeemed, partial payment).

SPK detail and related dashboard metrics reflect the updated balances and statuses immediately after NKB approval.
​

Rejected NKB do not affect SPK balances but remain recorded in NKB History for audit.

FR‑207 Access Control & Audit for NKB
Feature Name: NKB Access & Audit Trail

Description: NKB operations are restricted to authorized Store Staff and fully audited.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

Only Store Staff and designated admin roles can create, confirm, or reject NKB for a given store; other roles have view-only or no access according to RBAC.

The system logs who created and approved/rejected each NKB, including timestamps and any rejection reasons, to support reconciliation and compliance.
​

Audit records are retained according to organizational policy and can be accessed by Admin PT or higher roles through reporting or audit modules.