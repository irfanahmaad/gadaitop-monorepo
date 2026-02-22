FR‑186 View Notification List (Admin PT)
Feature Name: View Notification List

Description: The system displays a paginated list of notifications addressed to the logged-in Admin PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Notifikasi” page shows a table with columns such as No, Notification Name/Title, Description, and Date & Time, matching the design.

Notifications are ordered from newest to oldest and limited to events relevant to the Admin PT’s PT (e.g., branches and modules they can access).

The list supports pagination with controls at the bottom and a page-size selector (e.g., 10/25/100 rows per page).

FR‑187 Search and Filter Notifications
Feature Name: Search & Filter Notifications

Description: Admin PT can search and filter notifications to quickly find specific events.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

A search box allows keyword search on notification title and description; results update to show only matching notifications.

A Filter panel lets the user filter by date range, notification type/category (e.g., SPK, Payment, Stock Opname), and optionally read/unread status.
​

A Reset action clears all filters and search criteria, restoring the default notification list.

FR‑188 Notification Read Status and Navigation
Feature Name: Notification Read & Navigation

Description: The system tracks whether notifications have been read and can link them to underlying records.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

Notifications open their linked context (e.g., SPK detail, Stock Opname detail) when clicked, in the same or a new view depending on design.

Once opened, the notification is marked as Read and visually distinguished from unread items (e.g., different text style or indicator).
​

Admin PT can optionally mark selected notifications as Read/Unread in bulk via checkboxes and a bulk action toolbar.

FR‑189 Back Navigation from Notifications
Feature Name: Notifications Back Navigation

Description: The notifications page provides a Back button to return to the previous screen in the Admin PT portal.

Actor: Admin PT

Priority: Low

Acceptance Criteria:

Clicking “Kembali” returns the user to the prior page or a configured default (e.g., Dashboard) without losing authentication state.

Browser Back continues to work as expected, and no duplicate navigation entries are created when opening or closing the notifications list.
---
## Data Scoping & Multi-Tenancy (Admin PT)

Acceptance Criteria:
- All data queries **must** be securely filtered by the logged-in Admin PT's `ptId` (company UUID) to prevent cross-tenant data leakage.
- Where a branch selector/context is applicable, an optional **branch filter (`storeId` or `branchId`)** further narrows results to the selected subset.
- Backend API endpoints must enforce Role-Based Access Control (RBAC) and strictly reject any requests attempting to read or mutate data outside the Admin PT's authorized PT scope.
