FR‑092 View SPK Detail (Customer) – Desktop & Mobile
Feature Name: View SPK Detail (Customer)

Description: The system displays detailed information for a selected SPK in both desktop table layout and mobile card layout.

Actor: Customer

Priority: High

Acceptance Criteria:

From the SPK list, selecting an SPK opens a detail screen showing: item photo, SPK number, item name, PT/outlet, tenor, and financial summary (total, paid, remaining) as per design.

On desktop, NKB history and controls appear in a main content panel; on mobile, the same SPK details are presented as stacked cards with key fields and actions preserved.

Only SPK for the logged‑in customer can be opened; attempts to access an SPK belonging to another customer result in an error or redirect to the list.

FR‑093 View NKB History & Status
Feature Name: View NKB History

Description: The SPK detail page shows the list of NKB records linked to the SPK, including renewals and settlements, with clear statuses.

Actor: Customer

Priority: Medium

Acceptance Criteria:

The “Daftar NKB” area lists NKB with columns/fields: NKB Number, SPK Number, Amount Paid, Type (e.g., Renewal, Settlement), Date & Time, and Status (e.g., In Progress, Completed, Overdue).

NKB rows/cards are sorted by transaction date/time descending and filtered to the current SPK only.

Status badges and colors match the design and update automatically when payments or renewals complete.

FR‑094 Open Payment Options (Cicil vs Lunas)
Feature Name: Open SPK Payment Options

Description: From SPK detail, the customer can choose between paying installments (Bayar Cicil) or paying in full (Bayar Lunas) using dedicated dialogs.

Actor: Customer

Priority: High

Acceptance Criteria:

The SPK detail header contains buttons (and in mobile, card buttons) for “Bayar Cicil” and “Bayar Lunas” when the SPK is payable; fully settled SPK no longer show payment buttons.

Clicking “Bayar Cicil” opens the Bayar Cicil form; clicking “Bayar Lunas” opens the Bayar Lunas form, each overlaid on the SPK detail view.

The system ensures that only one payment dialog is open at a time and that closing it returns the user to the SPK detail state.

FR‑095 Bayar Cicil & Bayar Lunas Forms
Feature Name: SPK Payment Form (Cicil & Lunas)

Description: Payment forms collect method, amount, and show a cost breakdown before redirecting to the payment gateway.

Actor: Customer

Priority: High

Acceptance Criteria:

Both forms show payment methods (e.g., Cash, Transfer) and a “Nominal Pembayaran” field; Bayar Lunas pre‑fills the full settlement amount, while Bayar Cicil allows partial amount within configured min/max limits.

Each form displays a breakdown: interest, fees, and grand total; changing the amount recalculates totals according to business rules.

Clicking “Konfirmasi Pembayaran” on a valid form triggers the payment process (FR‑096); clicking “Batal” closes the dialog with no changes to SPK or NKB.

FR‑096 Online Payment Processing & Gateway
Feature Name: Process Online SPK Payment

Description: After confirmation, the system hands off to the online payment widget and handles the result for both partial and full payments.

Actor: Customer

Priority: High

Acceptance Criteria:

After confirmation, the system opens an order summary/payment widget showing the exact amount (e.g., IDR 650,000 or IDR 9,000,000) and available channels (VA, bank transfer, cards, e‑wallet, etc.) as in the design.

On successful payment notification from the gateway, the system creates/updates the corresponding NKB, adjusts SPK remaining balance and status, and logs payment reference details for audit.

If the payment fails, expires, or is cancelled, the system records the failed attempt (if needed) and leaves SPK and NKB financial data unchanged, while showing a clear error/cancel message.

FR‑097 Payment Result Screens (In Process & Success)
Feature Name: Payment Result & Status Screens

Description: The portal shows dedicated status screens indicating whether payment is in process or completed successfully.

Actor: Customer

Priority: Medium

Acceptance Criteria:

After redirecting back from the payment gateway, the customer sees an “In Process” screen while the system confirms the payment status; once confirmed, a “Payment Successful” screen is shown with key details (amount, date/time, SPK/NKB references).

Both result screens include a primary action (e.g., “Back to SPK Detail” or “Back to SPK List”) that returns the user to the portal while keeping data refreshed.

If the gateway indicates failure, an appropriate “Payment Failed” state (reusing the same result layout) is displayed instead of success, with guidance to retry or contact support.