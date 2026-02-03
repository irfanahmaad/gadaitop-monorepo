FR‑226 View Notification List (Store Staff)
Feature Name: View Notification List (Store)

Description: Store Staff can see a chronological list of notifications relevant to their store activities.

Actor: Store Staff

Priority: High

Acceptance Criteria:

The Notifikasi page displays a table with No, Notification Name/Title, Description, and Date & Time, matching the design.

Notifications shown are scoped to the Store Staff’s store and role, such as SPK created, NKB approved/rejected, Setor Uang status changes, Tambah Modal approvals, and important system alerts.
​

The list supports pagination and an adjustable page size selector (e.g., 10/25/100 rows).

FR‑227 Search and Filter Notifications
Feature Name: Search & Filter Notifications (Store)

Description: Store Staff can search and filter notifications to find specific events quickly.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

A search field filters notifications by title and description as the staff types.

A Filter panel allows filtering by date range and optionally by notification category (e.g., SPK, NKB, Cash, System), ensuring relevance and reducing noise.
​

A Reset action clears all filters and restores the default list.

FR‑228 Notification Read Status and Navigation (Store)
Feature Name: Read & Navigate from Notifications

Description: Notifications can be used as shortcuts to open related screens, and their read status is tracked.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

Clicking a notification opens the corresponding detail screen (e.g., SPK detail, NKB info, Setor Uang request) in the same application.

Once opened, the notification is marked as Read and visually distinguished from unread ones (e.g., bold vs regular text); Store Staff may also mark items as Read in bulk if supported.
​

Critical notifications (e.g., failed transactions, important system errors) are highlighted so Store Staff can quickly identify items requiring immediate attention.