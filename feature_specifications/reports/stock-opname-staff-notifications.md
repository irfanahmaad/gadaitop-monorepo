FR‑237 View Stock Opname Notification List
Feature Name: View Stock Opname Notifications

Description: The system displays a list of notifications related to Stock Opname tasks for the logged‑in staff.

Actor: Stock Opname Staff

Priority: High

Acceptance Criteria:

The “Notifikasi” page shows a table with No, Notification Name (for example “New SO Schedule”), Description, and Date & Time, matching the design.

Notifications listed are limited to Stock Opname events assigned to that staff member or their store, such as new SO schedules, changes to existing schedules, or cancellations.
​

The list supports pagination and a page‑size selector (e.g., 10/25/100 records).

FR‑238 Search and Filter Stock Opname Notifications
Feature Name: Search & Filter SO Notifications

Description: Staff can search and filter notifications to find specific Stock Opname tasks or messages.

Actor: Stock Opname Staff

Priority: Medium

Acceptance Criteria:

A search box filters notifications by title and description as the user types.

A Filter panel allows filtering by date range and (optionally) notification type or status, helping staff focus on upcoming or unread schedule alerts.
​

A Reset option clears filters and restores the full notification list.

FR‑239 Navigate from Notifications to Stock Opname Sessions
Feature Name: Open Stock Opname from Notification

Description: Notifications serve as shortcuts to the relevant Stock Opname sessions or schedule details.

Actor: Stock Opname Staff

Priority: Medium

Acceptance Criteria:

Clicking a notification about a new or updated SO schedule opens the corresponding Stock Opname session or schedule detail screen.

Once opened, the notification is marked as Read and visually distinguished from unread entries; critical or overdue schedule alerts are highlighted so staff can prioritize them.
​

If the linked session no longer exists or the user lacks permission, an appropriate message is displayed instead of a broken link.