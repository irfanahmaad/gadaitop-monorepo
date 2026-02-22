FR‑127 View Auction Item List
Feature Name: View Auction Item List

Description: The system displays a list of items marked for auction within the Admin PT’s PT and branches.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Lelangan” item list shows columns such as SPK Number, Item Name, Item Type, Branch, Estimated Value, Auction Status (e.g., Not Prepared, Ready, In Auction, Sold), and Actions, matching the table layout.

Only items eligible for auction and belonging to the Admin PT’s PT/branches are displayed; items from other PTs are never visible.
​

The list supports pagination and basic sorting (for example by status, value, or date).

FR‑128 Filter Auction Items
Feature Name: Filter Auction Items

Description: Admin PT can filter the auction item list by various criteria to focus on specific subsets.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

A filter panel allows filtering by auction batch, branch, item type, status, and date range; applying filters refreshes the item list accordingly.
​

A Reset action clears all filters and returns the list to the default state.

Filter settings remain applied when navigating between list and detail views within the same session.

FR‑129 View Auction Batch Detail
Feature Name: View Auction Batch Detail

Description: The system groups items into auction batches and provides a detail screen per batch.

Actor: Admin PT

Priority: High

Acceptance Criteria:

Opening an auction batch (e.g., “BTC001”) shows batch header data (batch code, date, location, status) and a “Daftar Barang Lelang” table listing all items in that batch.

The batch detail table includes per‑item auction fields such as reserve price, starting price, last bid, winner (if sold), and item auction status (e.g., Ready, On Auction, Sold, Unsold).
​

Batch status (e.g., Draft, Open, Closed) is clearly indicated and restricts which actions are allowed.

FR‑130 Edit Auction Batch
Feature Name: Edit Auction Batch

Description: Admin PT can edit batch-level settings such as date, location, and applicable rules.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The “Edit Batch Lelang” form allows updating batch date, auction location, auctioneer/handler, and optional notes or conditions.

Saving changes updates the batch header and triggers a confirmation dialog followed by a success message when the operation completes.
​

Certain fields become read‑only when the batch is in locked states (e.g., Closed) according to business rules.

FR‑131 QR Code for Auction Items / SPK
Feature Name: QR Code for Auction Items

Description: The Auction module provides QR codes for items or SPK used during the auction process.

Actor: Admin PT, Auction Staff

Priority: Medium

Acceptance Criteria:

A “QR Code SPK” panel displays a QR code representing either the SPK or auction item, with actions like Close and Print QR.

Scanning the QR with supported devices brings up the corresponding item detail or bidding screen, enabling fast identification and status updates during the auction.
​

Printed QR codes are suitable for attaching to physical items or auction catalogs and remain scannable throughout the event.

FR‑132 Update Auction Item Status
Feature Name: Update Auction Item Status

Description: From the auction item or batch detail views, Admin PT can update auction statuses such as prepared, in auction, sold, or unsold.

Actor: Admin PT

Priority: High

Acceptance Criteria:

Actions (e.g., “Mark as Ready”, “Mark as Sold”, “Mark as Unsold”) are available per row, aligned with the status column shown in the design.

Status changes open confirmation dialogs (with success dialogs on completion), and the table visually reflects the new status (colors/badges) without full page reload.
​

Items marked as Sold capture and store sale details (final price, buyer reference if tracked); items marked as Unsold can later be reassigned to another auction batch according to business rules.

FR‑133 View Item Detail from Auction
Feature Name: View Auction Item Detail

Description: Admin PT can open a full item detail view directly from the auction context.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

Clicking on an item in the auction list or batch detail opens the same “Detail Item” screen used elsewhere, showing SPK details, item specs, condition, location, and evidence photos.

From this item detail, Admin PT can see whether the item is in auction, sold, or still in inventory, and navigate back to the auction list/batch while preserving filters and pagination.
---
## Data Scoping & Multi-Tenancy (Admin PT)

Acceptance Criteria:
- All data queries **must** be securely filtered by the logged-in Admin PT's `ptId` (company UUID) to prevent cross-tenant data leakage.
- Where a branch selector/context is applicable, an optional **branch filter (`storeId` or `branchId`)** further narrows results to the selected subset.
- Backend API endpoints must enforce Role-Based Access Control (RBAC) and strictly reject any requests attempting to read or mutate data outside the Admin PT's authorized PT scope.
