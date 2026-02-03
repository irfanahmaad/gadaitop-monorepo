FR‑086 View Customer SPK List
Feature Name: View Customer SPK List

Description: The system displays a list of SPK contracts belonging to the logged‑in customer in table form.

Actor: Customer

Priority: High

Acceptance Criteria:

The “Portal Customer > Daftar SPK” page shows a table with columns such as No, SPK Number, Item Name, PT Name, Outlet Name, Nominal, and SPK Date & Time, matching the design.

Only SPK linked to the authenticated customer are shown; no other customers’ SPK can appear in this list.
​

The table is paginated and responsive, remaining readable on desktop and mobile without horizontal scrolling for key columns.

FR‑087 Customer SPK Pagination
Feature Name: SPK List Pagination (Customer)

Description: The SPK list uses pagination controls so customers can navigate through all their contracts.

Actor: Customer

Priority: Medium

Acceptance Criteria:

Customers can change “rows per page” using the dropdown (e.g., 10, 25, 100) and navigate pages using Previous, Next, and page numbers.

The “Showing X–Y of Z results” text reflects the correct range and total SPK count for that customer.

Pagination works together with any active search or filter so that moving between pages keeps the same criteria applied.
​

FR‑088 Search Customer SPK
Feature Name: Search SPK (Customer)

Description: The SPK list provides a search field to quickly find a customer’s SPK by keyword.

Actor: Customer

Priority: High

Acceptance Criteria:

Typing a keyword (e.g., SPK number or item name) and pressing Enter or clicking the search icon filters the table to matching SPK records.
​

When no SPK match the keyword, an empty state message is shown instead of a technical error.

Clearing the search restores the full SPK list for that customer.

FR‑089 Filter and Sort Customer SPK
Feature Name: Filter & Sort SPK (Customer)

Description: The SPK list offers filter and sort options so customers can narrow down contracts by date and status, and change the sort order.

Actor: Customer

Priority: Medium

Acceptance Criteria:

Clicking the “Filter” button opens a panel with at least: Date range (Start/End) and Status options (e.g., Due, Already Paid), plus sort options (e.g., A–Z, Z–A, Latest First, Oldest First).

Applying filters narrows the SPK list to records that match all chosen criteria; the active filter state is clearly indicated until cleared.
​

Sort selection changes the order of SPK rows according to the chosen rule and works in combination with filters.

FR‑090 Highlighted SPK Cards & Quick Actions (Left Panel)
Feature Name: Highlighted SPK & Quick Actions

Description: The left panel shows highlighted SPK cards (e.g., SPK close to due) with quick actions such as “Bayar Cicil” and “Bayar Lunas”.

Actor: Customer

Priority: Medium

Acceptance Criteria:

The left panel displays one or more “priority” SPK (for example nearest due or overdue), each showing SPK code, outlet, item, and outstanding amount, as indicated in the design.

Each card has quick‑action buttons (e.g., Pay Installment, Pay in Full) that navigate to the appropriate payment flow or detail page for that SPK, according to the business rules.
​

Highlighted SPK are always a subset of the customer’s own SPK and update when contract statuses change.

FR‑091 SPK Row Actions (Detail & Payment)
Feature Name: SPK Row Actions (Customer)

Description: Each SPK row in the table provides actions to view details and start payment‑related flows.

Actor: Customer

Priority: High

Acceptance Criteria:

Each SPK row has an Action menu or buttons (as per design) with at least “Detail” and payment‑related options (e.g., Pay Installment, Pay in Full) if the SPK is eligible.

Selecting “Detail” opens the SPK detail screen for that specific contract; selecting a payment action opens the corresponding payment or confirmation screen.

Actions are enabled or disabled based on SPK status: for example, fully paid SPK no longer show payment options but can still be opened in Detail view.
