FR‑213 View Setor Uang Request List (Store Staff)
Feature Name: View Cash Deposit Requests (Store)

Description: The Setor Uang page shows all deposit requests initiated from the Store Staff’s store and their current status.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The table displays columns such as Request Date & Time, Requested By, Store Name, Alias, Amount, Status (Pending, Transaction Successful, Failed, Approved/Rejected), and Actions.

Only requests for the Store Staff’s store are visible; statuses update in real time as payments and approvals occur.

The list supports pagination and optional filtering (e.g., by date or status).

FR‑214 Initiate Cash Deposit Request & Generate Payment Channel
Feature Name: Create Cash Deposit Request

Description: Store Staff can create a new Setor Uang request and generate a QR/virtual account for payment.

Actor: Store Staff

Priority: High

Acceptance Criteria:

Creating a request records the nominal amount of cash to be deposited and sets status to Pending; a payment interface opens showing available payment channels (e.g., bank transfer, QRIS, e-wallet) consistent with the mockups.
​

For QR/QRIS payment, the system generates a QR code with the correct amount; Store Staff can scan/pay using a banking app and then click “Check Status” to verify payment success.

When the external payment provider confirms a successful transaction, the request status changes to “Transaction Successful” and a success dialog is shown.

FR‑215 Approve or Reject Deposit Request (Internal Confirmation)
Feature Name: Approve/Reject Store Cash Deposit

Description: After payment is successful, the deposit request must be approved or can be rejected with a reason.

Actor: Store Staff (or Admin PT, depending on workflow)

Priority: Medium

Acceptance Criteria:

For each request, an action menu allows marking the deposit as “Approved/Disetujui” or “Rejected/Ditolak”; selecting Reject opens a form where staff must enter a reason.

Confirming Approve or Reject shows a confirmation dialog; after confirmation, the status updates accordingly and appears in the list with appropriate color coding.

Rejected deposits do not update the branch’s cash ledger; reasons are stored and viewable for audit and follow-up.
​

FR‑216 Cash Ledger & Audit Integration
Feature Name: Cash Ledger Update & Audit for Setor Uang

Description: Approved deposits impact the store’s cash-in-transit and head office ledger, with full traceability.

Actor: System

Priority: High

Acceptance Criteria:

When a Setor Uang request reaches the Approved state, the system posts the appropriate accounting entries (e.g., reduce branch cash, increase cash-in-transit/head office) according to the organization’s accounting rules.
​

Every key event—request creation, payment success/failure, approval, rejection—is logged with timestamp, user, and any entered reason, accessible to Admin PT/head office for reconciliation.

Failed payments remain in a recoverable state (e.g., status Failed) and can be retried or cancelled according to defined procedures.