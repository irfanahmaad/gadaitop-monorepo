FR‑222 View Mutasi/Transaksi List
Feature Name: View Cash Mutations (Store)

Description: The Mutasi/Transaksi page shows all cash movements affecting the store’s cash balance.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The table displays columns such as Date & Time, Store, Mutation Type (e.g., SPK1, SPK2, Operational, Tambah Modal), Debit, Credit, and Remaining Balance, matching the design.

Entries include system-generated records (from SPK, NKB, Setor Uang, Tambah Modal) as well as manual operational entries created by Store Staff.

The list supports pagination and filtering by date range, mutation type, or store (if user has multi-store access).

FR‑223 Add Manual Operational Mutation
Feature Name: Add Operational Cash Mutation

Description: Store Staff can manually record operational cash transactions (e.g., small expenses) not created by other modules.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

Clicking “Tambah Data” opens a form with fields: Nominal amount, Type (e.g., Operational), and Description/Notes explaining the expense or income.

On Save, the system asks for confirmation; once confirmed, the transaction appears in the list as a debit or credit according to the selected type, and the remaining balance is recalculated.
​

Each manual mutation is tagged with the creating user and can later be edited or reversed according to business rules.

FR‑224 Automatic Mutations from Other Modules
Feature Name: Auto-Generated Mutations

Description: Financial events from other features automatically create corresponding records in Mutasi/Transaksi.

Actor: System

Priority: High

Acceptance Criteria:

Disbursement of an SPK, receipt of NKB payments, Approved Setor Uang, and Approved Tambah Modal each generate appropriate debit/credit entries, preserving a complete cash trail for the store.
​

Auto-generated entries are read-only in Mutasi/Transaksi; any correction must be done via the originating module to keep ledgers consistent.

The running balance column always reconciles with the store’s actual cash-on-hand and bank balances maintained elsewhere.

FR‑225 Audit & Reconciliation Support
Feature Name: Cashbook Audit & Reconciliation

Description: The Mutasi/Transaksi feature supports daily reconciliation and audit of store cash.

Actor: Store Staff, Admin PT

Priority: Medium

Acceptance Criteria:

Store Staff can export or print the mutation list for a chosen period to reconcile against physical cash counts and bank statements.

The system enforces that each entry has sufficient description and, where applicable, links to supporting documents or voucher numbers, following petty cash best practices.
​

Admin PT can view or report on mutations per store for oversight and anomaly detection.