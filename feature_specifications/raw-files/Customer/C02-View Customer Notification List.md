FR‑101 View Customer Notification List
Feature Name: View Customer Notifications

Description: The system displays a “Daftar Notifikasi” page listing notifications belonging to the logged‑in customer.

Actor: Customer

Priority: High

Acceptance Criteria:

The Notifications page shows a table with columns: No, Notification Name, Description, and Date & Time, as in the design.

Only notifications generated for the current customer are shown; no notifications for other customers appear in this list.
​

The list is read‑only; there are no row‑level edit/delete actions, but rows may be clickable in future to open related SPK or payment details if defined.

FR‑102 Pagination for Customer Notifications
Feature Name: Customer Notification Pagination

Description: The notification list uses pagination so customers can browse their full notification history.

Actor: Customer

Priority: Medium

Acceptance Criteria:

Customers can adjust the “rows per page” value (e.g., 10, 25, 100) via the dropdown at the top of the table.

“Previous”, “Next”, and page number controls at the bottom navigate between pages, and the content and active page indicator update correctly.
​

The footer “Showing X–Y of Z results” accurately reflects the range and total number of notifications for that customer.

FR‑103 Search & Filter Customer Notifications
Feature Name: Search & Filter Notifications (Customer)

Description: The notification list provides a search field and filter panel to help customers quickly find specific notifications.

Actor: Customer

Priority: Medium

Acceptance Criteria:

The search box allows entering a keyword (e.g., SPK number, “Pembayaran Berhasil”) and, on Enter or search icon click, filters the list to notifications whose name or description contains the keyword.
​

Clicking the “Filter” button opens a panel with at least date‑range filters (From/To); applying the filter restricts the table to notifications within that period.

Search and date filters can be combined; clearing filters/search restores the full notification list.

FR‑104 Back Navigation from Customer Notifications
Feature Name: Back from Customer Notifications

Description: The notifications page provides a Back button to return to the previous Customer Portal screen.

Actor: Customer

Priority: Low

Acceptance Criteria:

Clicking the “Kembali/Back” button in the top‑right corner returns the customer to the previous page (for example, SPK list or dashboard) using the defined navigation pattern.

Back navigation does not affect notification data; if the customer reopens Notifications, filters and pagination may either be reset or restored based on the agreed UX rule, consistently.