FR‑140 View Cash Deposit Request List
Feature Name: View Cash Deposit Requests

Description: The system displays a list of cash deposit (setor uang) requests made by branches within the Admin PT’s PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Setor Uang” page shows a table with columns such as Request Date & Time, Requested By, Branch Name, Alias, Amount, Status (e.g., Pending, Transaction Successful, Failed, Deposited), and Actions, matching the design.

Only requests belonging to branches under the Admin PT’s PT are visible.

The table supports pagination and basic sorting by date, branch, or status.

FR‑141 Create Cash Deposit Request
Feature Name: Create Cash Deposit Request

Description: Admin PT (or authorized branch staff via this screen) can submit a new request to deposit cash from a selected branch/till to head office or central account.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Request Setor Uang” form includes at least: Branch, Ending Cash Balance/Till Balance (read‑only or pre‑filled), and Amount to Deposit, plus optional Notes.

Amount to Deposit must be a positive number and must not exceed the displayed ending balance; validation errors are shown inline when violated.
​

Clicking “Save” on a valid form creates a new request in Pending status and displays a success confirmation.

FR‑142 Update Cash Deposit Request Status
Feature Name: Update Cash Deposit Status

Description: Admin PT can update the status of cash deposit requests as they move through the process (e.g., Pending → Transaction Successful/Failed → Deposited).

Actor: Admin PT

Priority: High

Acceptance Criteria:

Each request row provides actions (e.g., via an Action menu) to mark the deposit as Transaction Successful, Failed, or Deposited, subject to current status.

Changing status triggers a confirmation dialog and then updates the status badge in the list after success; Failed status can capture a failure reason if configured.
​

Requests marked as Deposited represent cash already received/recorded at head office and become read‑only except for audit fields.

FR‑143 Filter Cash Deposit Requests
Feature Name: Filter Cash Deposit Requests

Description: Admin PT can filter cash deposit requests to focus on specific branches, periods, or statuses.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

A filter panel allows specifying criteria such as Date From/To, Branch, Status, and possibly Requestor; applying filters refreshes the table contents.
​

A Reset action clears all filters and restores the default view.

Filters remain applied while the user navigates between list and request form within the same session.

FR‑144 Access Control & Audit Trail for Setor Uang
Feature Name: Setor Uang Access & Audit

Description: The system restricts Setor Uang features to authorized Admin PT users and records an audit trail for each request and status change.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

Only users with the Admin PT role (and any configured permissions) can access the Setor Uang menu and perform create/update actions; other roles are denied or redirected.
​

For each request, the system logs who created it, who changed its status, what the new status is, and timestamps for each event.

Audit data is retained and viewable in either the request detail view or a separate log section, according to compliance needs.
---
## Data Scoping & Multi-Tenancy (Admin PT)

Acceptance Criteria:
- All data queries **must** be securely filtered by the logged-in Admin PT's `ptId` (company UUID) to prevent cross-tenant data leakage.
- Where a branch selector/context is applicable, an optional **branch filter (`storeId` or `branchId`)** further narrows results to the selected subset.
- Backend API endpoints must enforce Role-Based Access Control (RBAC) and strictly reject any requests attempting to read or mutate data outside the Admin PT's authorized PT scope.
