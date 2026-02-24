FR‑150 View SPK List (Admin PT)
Feature Name: View SPK List

Description: The system displays a list of SPK (pawn tickets/loan contracts) for branches under the Admin PT’s PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “SPK” page shows a table with columns such as Photo, SPK Number, Customer Name, Number of SPK (units/installments), Remaining SPK, and SPK Date & Time, matching the design.

A branch selector at the top limits the list to the selected branch; Admin PT can only choose branches belonging to their PT.

The table is paginated and supports basic sorting by SPK Number, customer name, and SPK date.

FR‑151 Filter SPK by Amount Range
Feature Name: Filter SPK by Amount

Description: Admin PT can filter SPK records based on SPK nominal amount range.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The Filter panel contains “SPK From” and “SPK To” fields, allowing the user to specify a minimum and maximum SPK amount.

Applying the filter shows only SPK whose principal/loan amount lies within the specified range; Reset clears the range and restores the full list.

If only one bound is provided (From or To), the system filters using that single bound accordingly.

FR‑152 View SPK Detail with Customer Summary
Feature Name: View SPK Detail (Admin PT)

Description: From the SPK list, the Admin PT can open a detailed view that combines customer profile and SPK information.

Actor: Admin PT

Priority: High

Acceptance Criteria:

Clicking a row or Detail action on the SPK list opens a “Data Customer” header showing customer avatar, name, NIK, date of birth, and other profile fields, followed by a “Detail SPK” section showing SPK number, SPK amount, remaining SPK, SPK date, and outstanding/remaining balance.

All data belongs to the selected SPK and is read-only on this screen (any edits must occur via dedicated edit flows if provided).

Breadcrumb and page title clearly indicate the Admin PT is on the SPK Detail screen for that specific customer and contract.

FR‑153 Show NKB History for SPK (Admin View)
Feature Name: View NKB History for SPK

Description: The SPK detail page includes an NKB history table showing all renewals and redemptions related to the SPK.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The “Daftar NKB” table lists records with columns such as NKB Number, SPK Number, Amount Paid, Type (e.g., Renewal, Redemption), Date & Time, Status (e.g., Paid, In Progress, Overdue), and Actions.

Records are sorted by transaction date/time descending and filtered to the current SPK only.
​

If the list is long, pagination is available and remains within the context of the current SPK.

FR‑154 Access Control & Branch Scope for SPK
Feature Name: SPK Access & Branch Scope

Description: The SPK module enforces branch/PT scoping and permissions for Admin PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

Admin PT can only view SPK and SPK Detail for branches under their PT; attempts to access SPK from another PT are blocked or redirected according to RBAC rules.
​

All SPK and NKB data displayed in this feature is consistent with the underlying loan management module (amounts, statuses, dates).

SPK actions that change financial state (e.g., renewal, redemption, forfeiture) are not performed from this list/detail view unless explicit flows are later defined; in this version, the screen is read‑only for monitoring and audit.
---
## Data Scoping & Multi-Tenancy (Admin PT)

Acceptance Criteria:
- All data queries **must** be securely filtered by the logged-in Admin PT's `ptId` (company UUID) to prevent cross-tenant data leakage.
- Where a branch selector/context is applicable, an optional **branch filter (`storeId` or `branchId`)** further narrows results to the selected subset.
- Backend API endpoints must enforce Role-Based Access Control (RBAC) and strictly reject any requests attempting to read or mutate data outside the Admin PT's authorized PT scope.
