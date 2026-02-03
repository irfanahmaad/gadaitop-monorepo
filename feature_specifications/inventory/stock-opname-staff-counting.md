FR‑232 View Stock Opname Session List
Feature Name: View Stock Opname Sessions

Description: The system displays a list of Stock Opname sessions for the staff’s store, including ongoing and completed sessions.

Actor: Stock Opname Staff

Priority: High

Acceptance Criteria:

The “Stock Opname” page shows a table with columns such as Session Code, Store, Status (e.g., Draft, In Progress, Completed), Created Date, and Last Updated, matching the desktop and mobile layouts.

Only sessions for the staff’s assigned store are visible unless broader permissions are granted.

Staff can filter or search sessions by status, date, or session code to quickly continue an existing count.
​

FR‑233 Perform Item Counting in a Session
Feature Name: Count Items in Stock Opname Session

Description: Within a selected session, staff can count each item, compare against system quantity, and record variances.

Actor: Stock Opname Staff

Priority: High

Acceptance Criteria:

The session detail screen lists items with columns like Item Code, Item Name, Location, System Quantity, Counted Quantity, and Variance (highlighting over/short).

Staff can input counted quantity manually or via QR code / barcode scanning from mobile; scanned codes focus the correct item row and increment the count as designed.
​

Variances are recalculated in real time and color‑coded (e.g., green for match, red for discrepancy).

FR‑234 QR Code Support & Item Detail
Feature Name: Scan Item via QR Code

Description: Staff can open an item’s QR code or scan items’ codes during Stock Opname to speed up identification.

Actor: Stock Opname Staff

Priority: Medium

Acceptance Criteria:

From the session or item detail, staff can display a QR code that encodes the item identifier for labelling, or use the camera to scan an existing QR attached to the item.

Scanning a QR code selects the corresponding item in the list or opens its detail view, showing information such as current status, last SPK, and images for verification.
​
​

If the scanned code is not recognized in the current session, the system shows an error message and offers to search the catalog or cancel.

FR‑235 Record Item Condition and Notes
Feature Name: Record Item Condition During Stock Opname

Description: While counting, staff can capture item condition, photos, and notes for items that are damaged, missing, or otherwise exceptional.

Actor: Stock Opname Staff

Priority: Medium

Acceptance Criteria:

An item detail or “Perubahan Barang” screen allows staff to select condition status (e.g., Good, Damaged, Missing) and attach photos as evidence, along with free‑text notes.

Saved conditions and notes are linked to the Stock Opname session and become part of the item’s history for subsequent decisions (repair, write‑off, investigation).
​

Condition changes that imply inventory adjustments are clearly marked so that approvers can review them before final posting.

FR‑236 Complete Session and Submit for Adjustment
Feature Name: Complete Stock Opname Session

Description: After counting all items, staff can close the session and submit variances for approval and inventory adjustment.

Actor: Stock Opname Staff

Priority: High

Acceptance Criteria:

When staff choose to complete a session, the system checks that all required locations/items have been counted; if not, it lists outstanding items or allows completion with justification.

On confirmation, the session status changes to Completed (or Pending Approval), and a summary of variances is generated for Admin PT or Inventory Manager to review and post as inventory adjustments.
​

Once completed, the session becomes read‑only for Stock Opname Staff; any subsequent changes must go through an approval or adjustment process defined in the inventory module.