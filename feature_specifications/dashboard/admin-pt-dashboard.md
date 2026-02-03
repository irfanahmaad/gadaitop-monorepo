FR‑109 Admin PT Dashboard Filters
Feature Name: Admin PT Dashboard Filters

Description: The Admin PT Dashboard provides global filters (PT, Branch, Date) that control all widgets on the page.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The PT dropdown is pre‑set to the PT owned by the Admin PT; the Admin PT cannot select any PT outside their authorization.

The branch/outlet dropdown and date selector update all KPI cards, charts, and tables on the dashboard according to the selected period and branch.
​

Active filters are clearly visible and remain consistent during the user session unless explicitly reset.

FR‑110 PT KPI Summary Cards
Feature Name: PT KPI Summary Cards

Description: The dashboard displays compact KPI cards summarizing SPK conditions for the PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

KPI cards at the top show metrics such as: number of SPK due within X days, number of SPK overdue beyond X days, total active pawn items, and overdue SPK ratio, following the design.

Values in the cards only count SPK/NKB data within the PT and branch selected by the Admin PT.
​

Changing any filter causes the card values to refresh within an acceptable response time (for example, under 2–3 seconds under normal load).

FR‑111 SPK Due & Overdue Chart (PT Scope)
Feature Name: SPK Due & Overdue Chart (PT)

Description: The Admin PT Dashboard shows a bar chart of SPK due and overdue, scoped to the selected PT and branch.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The chart displays due‑date buckets (for example 0–7 days, 8–14 days, >14 days) with the number of SPK in each bucket for the active filters.
​

Hovering a bar shows a tooltip with the category label and SPK count.

When no data exists for a given period, the chart displays a clear empty state without errors.

FR‑112 Pawn Trend Chart (PT)
Feature Name: Pawn Trend Chart (PT)

Description: The dashboard includes a line chart showing the trend of pawn transactions (count or amount) over time for the PT.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The line chart plots time periods (for example recent months) on the horizontal axis and the number or amount of pawn transactions on the vertical axis.

Data displayed is always limited to the PT and branch currently selected by the Admin PT.

Changing the date or branch filters refreshes the chart data without a full page reload.

FR‑113 Latest SPK & NKB Widgets (PT)
Feature Name: Latest SPK & NKB (PT)

Description: The dashboard shows small tables for the most recent SPK and NKB records for the Admin PT’s company.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The “New SPK” widget shows a limited number of latest SPK (for example 5) with columns such as SPK Number, Amount, and Customer Name; the “New NKB” widget shows NKB Number, Amount Paid, Type, and Status.

Both widgets are sorted by transaction date/time in descending order and are restricted to the currently selected PT and branch.
​

If defined in scope, clicking a row opens the corresponding SPK/NKB detail page; otherwise, the widgets are read‑only.

FR‑114 Today Due SPK Table (PT)
Feature Name: Today Due SPK List (PT)

Description: The Admin PT dashboard provides a detailed table of SPK that are due today (or within a defined date window) for that PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Today’s Due SPK” table lists SPK with columns: No, Photo, SPK Number, Customer Name, Number of SPK, Remaining SPK, and SPK Date & Time, matching the design.

Only SPK whose due date falls within the selected date range and belong to the Admin PT’s PT/branch are displayed.
​

The table supports vertical scrolling when there are many records and remains responsive on smaller screens.

FR‑115 Admin PT Dashboard Responsiveness & Access Control
Feature Name: Dashboard Responsiveness & PT‑Scoped Access

Description: The Admin PT dashboard is responsive and accessible only to users with the Admin PT role.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The layout of KPI cards, charts, and tables adapts to tablet and mobile screens (stacked layout) without overlapping elements or requiring horizontal scrolling for primary content.

Attempts to access the dashboard with a user who does not have the Admin PT role (for example Customer or other roles via direct URL) are blocked or redirected according to RBAC rules.
​

All data requests for the dashboard always filter by the PT associated with the Admin PT account so data from other PTs is never shown.