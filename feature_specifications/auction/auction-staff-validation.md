The Auction feature for this role allows staff to validate auction batches, manage auction items (including QR codes), record condition changes, and finalize auction results from both desktop and mobile layouts.
​

FR‑243 View Auction Validation List
Feature Name: View Auction Validation List

Description: The system displays a list of auction batches that require validation by Auction Staff.

Actor: Auction Staff

Priority: High

Acceptance Criteria:

The “Validasi Lelang” page shows a table of batches with fields such as Batch Code, Branch, Schedule Date, Total Items, and Status (e.g., Draft, Waiting Validation, Validated), following the desktop and mobile designs.

Staff can search and filter auction batches by branch, status, or date to quickly find sessions that need action.
​

Pagination is available so users can navigate through large numbers of batches.

FR‑244 Validate Auction Batch and Items
Feature Name: Validate Auction Batch & Items

Description: Within a selected auction batch, staff can review batch details, inspect each item, and mark them as approved or rejected for auction.

Actor: Auction Staff

Priority: High

Acceptance Criteria:

The batch detail screen shows information such as Auction Code, Branch, Auction Schedule, and a progress bar indicating how many items have been validated.

A list of items is displayed with columns like Item Code, Item Name, Appraisal Value, Reserve Price, and Validation Status; each item row includes buttons such as “Setuju” and “Tolak” to decide whether the item joins the auction.
​

When an item is rejected, staff can enter a reason and upload supporting photos if needed, and the batch progress bar updates accordingly.

FR‑245 Scan / Show Item QR Code
Feature Name: Auction Item QR Code

Description: For physical handling during auction preparation, staff can show or scan QR codes linked to items in a batch.

Actor: Auction Staff

Priority: Medium

Acceptance Criteria:

From the batch or item detail screen, staff can open a QR code view that displays the item’s unique identifier to stick on the item or scan at the auction venue.

Scanning an item’s QR code (from mobile) opens the corresponding item detail within the auction batch, allowing quick validation without manual search.
​
​

If a QR code does not belong to the current batch, the system shows an error and suggests searching in other batches.

FR‑246 Review Item Detail and Condition Changes
Feature Name: Review Auction Item Detail & Condition

Description: Auction Staff can view complete item details and, when necessary, update condition notes and evidence before the auction.

Actor: Auction Staff

Priority: Medium

Acceptance Criteria:

The item detail page shows fields such as Item Photo, Brand/Type, Serial Number, Appraisal Value, Last Stock Opname status, and current Auction status.

A “Perubahan Barang” form allows staff to record changes such as new damage or missing accessories, add textual notes, and upload multiple photos as evidence.
​

Saved changes are stored in the item history and flagged so downstream roles (e.g., Admin PT or appraisers) can review and adjust prices or eligibility if required.

FR‑247 Finalize Auction Validation and Submit
Feature Name: Finalize Auction Validation

Description: After all items in a batch are processed, staff can complete the validation so the batch is ready for the auction event.

Actor: Auction Staff

Priority: High

Acceptance Criteria:

When all mandatory items have been marked as approved or rejected, staff can tap a “Selesai Validasi” / “Submit” button to finalize the batch.

The system performs validation to ensure required fields (decisions, reasons for rejection, condition notes where needed) are complete; if not, it lists remaining items that must be handled.
​

On success, the batch status changes to Validated (or equivalent), becomes read‑only for Auction Staff, and triggers notifications to the next responsible role about the upcoming auction.