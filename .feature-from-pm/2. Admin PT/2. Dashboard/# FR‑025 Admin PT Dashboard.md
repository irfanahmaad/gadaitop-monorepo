# FR‑025 Admin PT Dashboard

## Feature Name
Admin PT Dashboard Overview

## Description
The system provides a **Dashboard** page for the Admin PT role that presents key operational metrics and the latest activities related to SPK (loan contracts), NKB (payment receipts), and due SPK in a single consolidated view.  
This Dashboard is the **default landing page** after a successful Admin PT login and is intended to help Admin PT monitor daily performance of the PT/branches without navigating through multiple menus.

## Actor
- Admin PT (Primary Admin)  
- Admin PT (Temporary Admin PT accounts)  

## Priority
High  

---

## Preconditions

1. The user is logged in as Admin PT and has an active session (see the Admin PT Login FR).  
2. The Admin PT has sufficient permission to read SPK, NKB, and due-date information for the PT/branches assigned to them.  
3. Backend services/APIs for Dashboard metrics (SPK, NKB, due SPK, pawned items trend) are available and reachable.

---

## Postconditions

1. The Admin PT sees an overview of the current pawn portfolio status (number of due SPK, new SPK, new NKB, trend of pawned items, today’s due SPK list) based on the selected PT and date.  
2. The Dashboard acts as a starting point for navigation: from each card/list, the Admin PT can optionally drill down into more detailed modules (SPK list, NKB list, due-date reports) defined in separate FRs.  
3. Dashboard visits and filter changes can optionally be tracked in audit/analytics logs.

---

## UI & Interaction Requirements

### Overall Layout
- Left sidebar shows the Admin PT navigation menu, including: Dashboard, SPK, Stock Opname, Auction, Add Capital, Deposit Money, Mutation/Journal, etc.  
- Top bar on the Dashboard:
  - Page title: **“Dashboard”**.  
  - PT selector dropdown (e.g., “PT Gadai Top Indonesia”) for Admin PT users who manage more than one PT.  
  - Date picker to select the **reference date** for the dashboard (default: today).  
  - User profile area on the top-right.

### Summary Cards (Top KPI Row)
The first row contains several small KPI cards, for example:

1. **Overdue SPK ≥ X Days**  
   - Shows the count of SPK that are overdue by at least X days (e.g., 15 days).  
   - Card may use warning color (orange/red) to highlight risk.

2. **SPK Due 0–X Days (Upcoming/Recent Due)**  
   - Shows count of SPK that are due within a configured range (e.g., due today to within 1 month).

3. **Active Pawned Items**  
   - Shows the total number of active pawn contracts (SPK not yet fully repaid and not auctioned).

4. **New SPK Today / Today’s SPK Rate**  
   - Shows the number (or rate) of newly created SPK on the selected date.

Behaviour:
- Values on all cards are automatically updated whenever PT or date filter changes.  
- Optionally, clicking a card can navigate to a filtered list page with the underlying SPK records.

### Chart: “SPK Jatuh Tempo & Overdue”
- Horizontal bar chart summarising SPK counts by due/overdue buckets, for example:
  - Due within 0–X days.  
  - Overdue X–Y days.  
  - Overdue > Y days.  
- X-axis: count of SPK.  
- Y-axis: bucket labels (or branches, depending on the final design).  
- Hovering a bar shows a tooltip with bucket label and exact count.

### Chart: “Tren Barang Gadai” (Pawned Items Trend)
- Line chart showing the trend of new pawned items over time (e.g., per day for the last 7 days or per month).  
- X-axis: time period (date/month).  
- Y-axis: number of pawned items.  
- Each point on the line can show a tooltip with exact value and period on hover.

### Widget: “SPK Baru” (New SPK)
- Compact table showing the latest SPK entries, e.g., 5–10 rows:  
  - Columns (minimum):
    - SPK Number  
    - Loan Amount  
    - Customer Name  
- Sorted from newest to oldest SPK by creation date/time.  
- Clicking the SPK Number can navigate to its SPK Detail page (defined in SPK module FR).

### Widget: “NKB Baru” (New NKB)
- Compact table showing the latest NKB records:  
  - Columns (minimum):
    - NKB Number  
    - Paid Amount  
    - Type (Full Settlement / Extension)  
    - Status (Paid, Ongoing, Overdue)  
- Sorted from newest to oldest NKB.  
- Clicking the NKB Number can navigate to NKB Detail (separate FR).

### Table: “Daftar SPK Jatuh Tempo Hari Ini” (SPK Due Today)
- Larger table at the bottom listing all SPK due on the selected date (default: today).  
- Columns (minimum):
  1. No (running number).  
  2. Customer avatar/photo.  
  3. SPK Number.  
  4. Customer Name.  
  5. SPK Amount (loan principal).  
  6. Remaining Loan (outstanding principal).  
  7. SPK Date & Time and/or Due Date.  
- The table supports vertical scrolling and pagination with:
  - “Showing X–Y of Z results” summary, and  
  - Pagination controls (Previous, page numbers, Next) consistent with other tables.  
- Optionally, a per-row click or action menu can be provided to open SPK Detail or trigger reminder actions in future FRs.

---

## Data & Behavior Requirements

### Data Sources & Filters
- All dashboard data must be filtered by:
  - **PT** selected in the PT dropdown (Admin PT can only see PTs they manage).  
  - **Reference date** selected in the date picker (used for “today” metrics and as an anchor for trend ranges).  
- Dashboard data should be fetched via dedicated dashboard endpoints (aggregated metrics), not by downloading full raw lists of SPK/NKB on the client.

### Refresh & Interaction Rules
- Changing PT:
  - Triggers a refresh of all widgets (KPI cards, charts, new SPK/NKB tables, and due-today table).  
- Changing date:
  - Recomputes date-sensitive metrics (due-today counts, overdue categories, today’s new SPK/NKB, trend range).  
- Optional Refresh button:
  - Allows Admin PT to manually refresh dashboard data (e.g., after knowing new transactions have occurred).

### Example Calculation Rules (subject to final business decision)
- **SPK Due Today**: SPK with `dueDate = selectedDate` and status not fully paid/auctioned.  
- **Overdue SPK ≥ X Days**: SPK with `dueDate + X days < selectedDate` and not fully paid.  
- **Active Pawned Items**: SPK with status “running” or “overdue” (not fully repaid, not auctioned).  

---

## Security & Business Rules

1. Admin PT can see dashboard data only for PTs and branches assigned to them; PT dropdown must not offer PTs outside that scope.  
2. Dashboard must not expose sensitive technical information (passwords, internal tokens, etc.); only business‑level data relevant to operations is shown.  
3. All queries respect soft‑delete rules: records flagged as deleted should generally be excluded from aggregates unless a specific rule says otherwise.  
4. If the Admin PT account becomes inactive or loses required permissions, access to the Dashboard must be blocked and the user redirected to login or an appropriate error page.

---

## Acceptance Criteria

1. After a successful Admin PT login, the user is redirected to the Dashboard page showing:
   - Top KPI summary cards,  
   - “SPK Jatuh Tempo & Overdue” chart,  
   - “Tren Barang Gadai” chart,  
   - “SPK Baru” and “NKB Baru” widgets, and  
   - “Daftar SPK Jatuh Tempo Hari Ini” table — visually aligned with the Figma design.  
2. Changing the PT in the dropdown immediately updates all metrics and charts to reflect that PT, without breaking the layout.  
3. Changing the reference date updates date-dependent metrics and lists (due-today SPK, overdue counts, trends) according to the agreed business rules.  
4. The “Daftar SPK Jatuh Tempo Hari Ini” table shows the correct SPK data (for the selected PT and date), with accurate pagination and “Showing X–Y of Z results” summary.  
5. If there is no data for a widget (e.g., no new SPK today), that section shows a clear empty state message instead of errors.  
6. If any dashboard API call fails, the page shows a user‑friendly error message and a retry mechanism, while the overall dashboard layout remains intact.  
