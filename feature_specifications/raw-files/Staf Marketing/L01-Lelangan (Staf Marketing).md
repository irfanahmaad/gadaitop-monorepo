FR‑254 View Auction Batch List (Marketing)
Feature Name: View Auction Batch List (Marketing)

Description: Marketing Staff can view a list of auction batches to plan promotions and content.

Actor: Marketing Staff

Priority: High

Acceptance Criteria:

The “Lelangan” page shows batches in a table (desktop) or stacked cards (mobile) with Batch Code, Branch, Auction Date & Time, Total Items, and Status fields visible.

Search and filters allow narrowing batches by branch, date range, and status (Draft, Scheduled, Completed), and results are identical on desktop and mobile views.

Marketing Staff have read‑only access; they cannot change batch status, prices, or technical fields.

FR‑255 View Auction Batch Detail
Feature Name: View Auction Batch Detail (Marketing)

Description: Marketing Staff can open a batch to see detailed information required for campaign planning.

Actor: Marketing Staff

Priority: High

Acceptance Criteria:

The batch detail screen displays general info (Batch Code, Branch, Auction Schedule, Location, brief Description) and a progress indicator for item readiness.

A list of items is shown with key marketing fields: Item Name, Category, Main Photo thumbnail, Starting/estimate price, and Auction Status.

Layout is responsive: on mobile, header details appear at the top and item rows stack vertically but expose the same data as the desktop layout.

FR‑256 View Auction Item Detail
Feature Name: View Auction Item Detail (Marketing)

Description: Marketing Staff can inspect each item’s detail to prepare promotional materials.

Actor: Marketing Staff

Priority: Medium

Acceptance Criteria:

The item detail page shows fields such as Title, Brand/Model, brief Description, Specifications highlights, Photos gallery, and pricing info marked as read‑only.

From this page, staff can open the item’s QR code in full screen for downloading or embedding in offline marketing assets.

Navigation back to the batch or item list is available on both desktop and mobile without losing the previous scroll position.

FR‑257 Add Marketing Notes and Attachments
Feature Name: Add Marketing Notes & Assets

Description: Marketing Staff can record marketing‑specific notes and upload supporting files for batches and items.

Actor: Marketing Staff

Priority: Medium

Acceptance Criteria:

A “Marketing Notes” section allows entering free‑text notes (e.g., campaign plan, target channel, key message) tied either to the batch or to a specific item.

Staff can upload image files and documents (for example banner mockups or copy drafts); uploaded files are listed with filename, type, and upload time and can be previewed or downloaded.

Notes and attachments are visible to other authorized roles but do not alter the official appraisal, stock, or auction status.

FR‑258 Permissions and Security for Marketing Auction Access
Feature Name: Marketing Auction Access Control

Description: The system enforces role‑based permissions so Marketing Staff cannot interfere with operational auction data.

Actor: Marketing Staff

Priority: High

Acceptance Criteria:

Users with the Marketing Staff role can view batches, items, and related QR codes, and create/edit only marketing notes and marketing attachments.

Fields such as appraisal value, reserve price, stock status, and validation flags are locked for editing; any attempt to change them is blocked and an informative message is shown.

Access to this module is audited with log entries capturing who viewed which batch or item and when, consistent across desktop and mobile clients.
