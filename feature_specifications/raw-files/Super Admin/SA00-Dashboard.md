FR‑069 Dashboard Filters (PT, Branch, Date)
Feature Name: Dashboard Global Filters

Description: The Dashboard provides dropdown filters for PT, branch/location, and date to control the data shown in all widgets.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

The top filter bar includes: PT selector, Branch selector, and Date selector matching the design.

Changing any filter value refreshes all dashboard widgets (cards, charts, and tables) to reflect the selected PT, branch, and date or date range.
​

The current filter selections remain applied when navigating away from and back to the Dashboard within the same session, according to the chosen UX rule.

FR‑070 KPI Summary Cards
Feature Name: Dashboard KPI Cards

Description: The Dashboard displays summary KPI cards (e.g., SPK due & overdue counts, new SPK, new NKB, inventory stats) for quick status checks.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

At the top of the content area, KPI cards show metrics such as: SPK Jatuh Tempo ≤ X days, SPK Jatuh Tempo > X days, number of new NKB, and other key counts as defined.
​

KPI values automatically update according to the selected PT, branch, and date filters.

Cards use consistent color coding or icons to distinguish normal vs critical states (e.g., overdue highlighted).

FR‑071 SPK Jatuh Tempo & Overdue Chart
Feature Name: SPK Due & Overdue Chart

Description: The Dashboard includes a bar chart showing counts of SPK by due‑date category (e.g., 0–7 days, 8–14 days, >14 days).

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

The bar chart displays predefined due‑date buckets with corresponding SPK counts, based on transactions filtered by PT, branch, and date.
​

Hovering over a bar shows a tooltip with the exact count and category label.

When filter values change, the chart updates within an acceptable response time (e.g., under 2 seconds on typical data volumes).
​

FR‑072 Gadai Trend Chart
Feature Name: Pledged Item Trend Chart

Description: The Dashboard includes a line chart showing trends in pledged items (e.g., number of transactions per month or period).

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

The line chart plots time on the horizontal axis (e.g., recent months) and a metric such as total Gadai volume on the vertical axis.

Data points and line updates respond to changes in PT, branch, and date filters.

Hovering on a point shows a tooltip with the period label and metric value.

FR‑073 New SPK and New NKB Tables
Feature Name: Latest SPK & NKB Widgets

Description: The Dashboard displays two small tables summarizing the most recent SPK and NKB records.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

The “SPK Baru” and “NKB Baru” widgets each show a limited number of the latest records (e.g., last 5) with columns such as Number, Amount, Customer Name, Type, and Status as per design.
​

Records are sorted by transaction date/time descending and filtered by PT, branch, and date.

Clicking a record may open a detail view or underlying module (if defined in scope); if not, the widget remains read‑only.

FR‑074 Today’s Due SPK Table
Feature Name: Today Due SPK List

Description: The Dashboard shows a detailed table of SPK that are due today (or within a defined date range) at the bottom of the page.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

The table lists SPK with columns such as No, Photo, SPK Number, Customer Name, Number of SPK, Remaining Amount, and Due Date & Time as shown in the design.

Only SPK whose due date falls within “today” (based on the current dashboard filters) appear in this table.
​

The table supports vertical scrolling within its container and remains readable on tablet and mobile (responsive layout).

FR‑075 Dashboard Responsiveness & Performance
Feature Name: Responsive & Performant Dashboard

Description: The Dashboard layout adapts to different screen sizes and maintains acceptable performance.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

On smaller screens, widgets stack vertically but remain readable; filters and KPIs stay accessible without horizontal scroll.

Dashboard data loads or refreshes within agreed performance limits (for example, initial load under 3 seconds under normal load).
​

Errors in loading individual widgets show clear error states without breaking the rest of the Dashboard.