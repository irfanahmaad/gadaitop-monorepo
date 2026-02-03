For the Auction Staff role, the Notifications page lists alerts about new or updated auction schedules so staff can prepare and validate batches on time.
​

FR‑248 View Auction Notifications
Feature Name: View Auction Notifications

Description: The system displays a table of notifications related to auction activities for the logged‑in Auction Staff.

Actor: Auction Staff

Priority: High

Acceptance Criteria:

The “Notifikasi” page shows columns: No, Notification Name (for example “Jadwal Lelang Baru”), Description, and Date & Time, as shown in the layout.

Only notifications related to this staff member or their branch are displayed, such as new auction schedules, rescheduled auctions, or cancellations.
​

The table supports pagination and allows choosing how many rows to show per page (e.g., 10, 25, 100).

FR‑249 Search and Filter Auction Notifications
Feature Name: Search & Filter Auction Notifications

Description: Auction Staff can search and filter notifications to focus on specific auction messages.

Actor: Auction Staff

Priority: Medium

Acceptance Criteria:

A search field filters the list by notification title and description when the user types an email, batch code, or keyword.

A Filter control lets users narrow notifications by date range and notification type (for example, New Schedule, Change, Cancellation).
​

A clear or reset action removes applied filters and restores the full notification list.

FR‑250 Open Auction Screen from Notification
Feature Name: Open Auction Screen from Notification

Description: Notifications provide quick navigation to the relevant auction batch or schedule detail.

Actor: Auction Staff

Priority: Medium

Acceptance Criteria:

Clicking a notification about an auction schedule opens the corresponding auction batch list or specific batch detail, depending on the notification type.

After opening, the notification is marked as read and visually distinguished from unread rows; high‑priority or imminent auctions may be highlighted so staff can prioritize them.
​

If the referenced batch or schedule is no longer available, the system shows an informative message instead of an error page.