FR‑259 View Marketing Auction Notifications
Feature Name: View Marketing Auction Notifications

Description: The system displays a list of notifications related to auction validation and schedules for Marketing Staff.

Actor: Marketing Staff

Priority: High

Acceptance Criteria:

The “Notifikasi” page shows a table with columns No, Notification Name (for example “Jadwal Validasi Baru”), Description, and Date & Time, as in the design.

Only notifications relevant to the logged‑in Marketing Staff (branch, campaigns, assigned auctions) are displayed, including new validation schedules, changes, and cancellations.
​

Pagination and a page‑size selector (e.g., 10/25/100) are available and behave the same on desktop and mobile.

FR‑260 Search and Filter Marketing Notifications
Feature Name: Search & Filter Marketing Notifications

Description: Marketing Staff can quickly find specific notifications using search and filters.

Actor: Marketing Staff

Priority: Medium

Acceptance Criteria:

A search box filters notifications by title and description when the user types a keyword (e.g., batch code, “validasi”, branch).

A Filter panel lets users narrow notifications by date range and notification type (New Validation Schedule, Schedule Change, Cancellation).
​

A Reset/Clear action removes all filters and restores the full notification list.

FR‑261 Open Auction Screens from Notification
Feature Name: Open Auction Screen from Notification (Marketing)

Description: Notifications serve as shortcuts for Marketing Staff to access the related auction batch or schedule.

Actor: Marketing Staff

Priority: Medium

Acceptance Criteria:

Clicking a notification opens the corresponding auction batch detail or schedule page in the Marketing Auction module, keeping the same permissions (read‑only on technical data).

After opening, the notification is marked as Read and visually differentiated from unread entries; high‑priority or imminent schedules may be highlighted.

If the linked batch or schedule is missing or access is restricted, the system shows an informative message instead of an error page.
