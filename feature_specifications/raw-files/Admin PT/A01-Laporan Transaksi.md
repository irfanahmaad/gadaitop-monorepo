FR‑155 Select Report Type
Feature Name: Choose Transaction Report Type

Description: The system allows Admin PT to choose which type of report to generate (e.g., SPK, Transaction, Stock Opname, Auction, etc.).

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Laporan Transaksi” page includes a dropdown labeled “Laporan” where the Admin PT selects a specific report type from a predefined list.

The selected report type determines which underlying dataset and columns will be used when generating the file.

If no report type is selected, clicking Download is disabled or shows a validation message asking the user to choose a report.

FR‑156 Set Custom Date Range for Reports
Feature Name: Set Report Date Range

Description: Admin PT can define a start and end date to filter data included in the report.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The form provides two date pickers: “Start Date” and “End Date”, defaulting to a sensible range (e.g., today or last 7 days).

Only transactions whose dates fall between the selected start and end dates are included in the generated report.
​

If the selected range is invalid (e.g., End Date before Start Date), the system shows an error and prevents report generation.

FR‑157 Download Report File
Feature Name: Download Transaction Report

Description: Admin PT can download the filtered report in a file format such as CSV or PDF.

Actor: Admin PT

Priority: High

Acceptance Criteria:

Clicking the “Download” button triggers report generation for the chosen report type and date range and initiates a file download to the user’s device.

The file format (e.g., CSV) is consistent across report types and contains the expected columns for that report.
​

If the report size exceeds configured limits, the system either restricts the date range or notifies the user to narrow filters.

FR‑158 Reset Report Filters
Feature Name: Reset Report Filter Form

Description: The system provides a Reset button to clear the form back to its default state.

Actor: Admin PT

Priority: Low

Acceptance Criteria:

Clicking “Reset” clears the selected report type and date fields (or reverts them to default values).

After reset, no report is selected and the Download button behaves as if the page was first loaded.

FR‑159 Access Control for Reports
Feature Name: Report Access Control

Description: Only authorized Admin PT users can access and download transaction reports.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The Laporan menu is visible only to users with the Admin PT role (and any additional reporting permission configured).

Attempts by unauthorized roles to access the report URL directly are denied or redirected according to RBAC rules.
​

Generated files are not stored indefinitely on the server; they follow system retention rules or are produced on demand to protect sensitive data.
---
## Data Scoping & Multi-Tenancy (Admin PT)

Acceptance Criteria:
- All data queries **must** be securely filtered by the logged-in Admin PT's `ptId` (company UUID) to prevent cross-tenant data leakage.
- Where a branch selector/context is applicable, an optional **branch filter (`storeId` or `branchId`)** further narrows results to the selected subset.
- Backend API endpoints must enforce Role-Based Access Control (RBAC) and strictly reject any requests attempting to read or mutate data outside the Admin PT's authorized PT scope.
