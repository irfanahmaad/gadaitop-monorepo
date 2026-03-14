# Staff Lelang and Staff Marketing – User Stories

This document consolidates user stories for **Staff Lelang (Auction Staff)** and **Staff Marketing** from the existing specifications (auction-staff-validation, marketing-staff-auction, notifications, auth) and aligns them with implementation gaps.

**Sources:** `auction/auction-staff-validation.md`, `auction/marketing-staff-auction.md`, `reports/auction-staff-notifications.md`, `reports/marketing-staff-notifications.md`, `auth/auction-staff-login.md`, `auth/marketing-staff-login.md`.

---

## 1. Staff Lelang (Auction Staff / Staf Lelang)

### 1.1 Specification Summary

| ID | Title | Summary |
|----|--------|--------|
| US-AUC-1 | View validation list | View "Validasi Lelang" list: batches with Batch Code, Branch, Schedule Date, Total Items, Status; search/filter by branch, status, date; pagination (FR-243). |
| US-AUC-2 | Validate batch and items | In batch detail: review batch, list items with validation status; per item "Setuju"/"Tolak"; rejection reason and photos; progress bar; finalize when all done (FR-244, FR-247). |
| US-AUC-3 | Item QR and scan | Show/scan item QR from batch or item detail; scan opens item in batch for quick validation; error if QR not in current batch (FR-245). |
| US-AUC-4 | Item detail and condition | View full item detail; "Perubahan Barang" form: record damage/condition changes, notes, evidence photos; saved for downstream review (FR-246). |
| US-AUC-5 | View auction notifications | "Notifikasi" list: auction-related (new schedule, reschedule, cancellation); scoped to staff/branch; pagination and page size (FR-248). |
| US-AUC-6 | Search/filter and open from notification | Search and filter notifications; click notification opens batch list or batch detail; mark read (FR-249, FR-250). |
| US-AUC-7 | Login and redirect | Login with email/password; if Auction Staff role, redirect to auction/validation dashboard (FR-240–FR-242). |

### 1.2 Acceptance Criteria (Staff Lelang)

- **AC-AUC-1.1:** Given I am Auction Staff, when I open Validasi Lelang, then I see a table with Batch Code, Branch, Schedule Date, Total Items, Status.
- **AC-AUC-1.2:** Given the list, I can search and filter by branch, status, and date; results support pagination.
- **AC-AUC-1.3:** The list is organized into three tabs: Dijadwalkan, Waiting for Approval (batches in validation phase), and Tervalidasi (validated/ready for auction).
- **AC-AUC-2.1:** Given a batch, I see batch details and a list of items with Validation Status; each item has "Setuju" and "Tolak" actions.
- **AC-AUC-2.2:** Given I reject an item, I can enter a reason and upload photos; batch progress updates.
- **AC-AUC-2.3:** Given all items are decided, I can finalize validation ("Selesai Validasi"); batch becomes Validated and is read-only.
- **AC-AUC-3.1:** Given batch or item detail, I can open item QR; from mobile I can scan QR to open the item in the batch.
- **AC-AUC-3.2:** If scanned QR does not belong to current batch, system shows an error.
- **AC-AUC-4.1:** Given item detail, I can use "Perubahan Barang" to record condition changes, notes, and evidence photos; data is stored for downstream review.
- **AC-AUC-5.1:** Given I am Auction Staff, when I open Notifikasi, I see auction-related notifications (new schedule, reschedule, cancellation) scoped to my branch/staff.
- **AC-AUC-5.2:** List supports pagination and page-size selector.
- **AC-AUC-6.1:** I can search and filter notifications; clicking a row opens the related batch list or batch detail and marks the notification as read.
- **AC-AUC-7.1:** On login with valid Auction Staff credentials, I am redirected to the auction/validation dashboard (or Validasi Lelang home).

---

## 2. Staff Marketing (Staf Marketing)

### 2.1 Specification Summary

| ID | Title | Summary |
|----|--------|--------|
| US-MKT-1 | View auction batch list | View "Lelangan" list (read-only): Batch Code, Branch, Date & Time, Total Items, Status; search/filter; no status/price edit (FR-254). |
| US-MKT-2 | View batch and item detail | Batch detail: general info, progress; item list with marketing fields; item detail: title, brand, description, specs, photos, pricing (read-only) (FR-255, FR-256). |
| US-MKT-3 | Item QR for marketing | Open item QR in full screen for download/embed in offline assets (FR-256). |
| US-MKT-4 | Marketing notes and attachments | Add/edit marketing notes (free text) and upload files for batch or item; list with filename, type, time; preview/download; no change to appraisal/status (FR-257). |
| US-MKT-5 | Permissions and audit | Marketing can only view auction data and edit marketing notes/attachments; appraisal, reserve, stock, validation locked; access audited (FR-258). |
| US-MKT-6 | View and use notifications | Notifikasi list: validation/schedule-related; scoped to branch/campaigns/assigned; search/filter; click opens batch/schedule; mark read (FR-259–FR-261). |
| US-MKT-7 | Login and redirect | Login; if Marketing role, redirect to marketing dashboard (FR-251–FR-253). |

### 2.2 Acceptance Criteria (Staff Marketing)

- **AC-MKT-1.1:** Given I am Marketing Staff, when I open Lelangan, I see a read-only list with Batch Code, Branch, Date & Time, Total Items, Status; I cannot change batch status or prices.
- **AC-MKT-1.2:** I can search and filter; results are identical on desktop and mobile.
- **AC-MKT-2.1:** Given a batch, I see general info, progress, and item list with Item Name, Category, Photo, Starting/estimate price, Auction Status.
- **AC-MKT-2.2:** Given item detail, I see title, brand, description, specs, photos, pricing (all read-only).
- **AC-MKT-3.1:** From item detail I can open the item QR in full screen for download or embedding in offline marketing assets.
- **AC-MKT-4.1:** I can add/edit marketing notes (free text) for a batch or item.
- **AC-MKT-4.2:** I can upload files (e.g. banners, copy); list shows filename, type, upload time; I can preview or download.
- **AC-MKT-4.3:** Notes and attachments do not alter appraisal, stock, or auction status.
- **AC-MKT-5.1:** I can view batches, items, and QR codes; I can create/edit only marketing notes and attachments; appraisal, reserve price, stock, validation fields are locked.
- **AC-MKT-5.2:** Access to the module is audited (who viewed what, when).
- **AC-MKT-6.1:** Given I am Marketing Staff, when I open Notifikasi, I see validation/schedule notifications scoped to my branch/campaigns/assigned batches.
- **AC-MKT-6.2:** I can search and filter; clicking a notification opens the related batch/schedule and marks it read.
- **AC-MKT-7.1:** On login with valid Marketing credentials, I am redirected to the marketing dashboard (or Lelangan home).

---

## 3. Implementation Gaps (reference)

| # | Area | Gap |
|---|------|-----|
| 1 | Marketing notes and attachments | Backend: add marketingNotes/marketingAssets to batch or batch-item; API for notes and asset upload. Frontend: "Marketing Notes" section and attachment UI for marketing role. |
| 2 | Notifikasi menu | Add MenuSubject.NOTIFIKASI; add to ROLE_MENU_MAP for auction_staff and marketing; sidebar link to Notifikasi page. |
| 3 | Dashboard for auction_staff and marketing | Provide PT context (e.g. user.companyId) or simplified dashboard when user has only Validasi Lelang + Lelangan menus. |
| 4 | QR full-screen / download | Ensure item QR can be opened full-screen for marketing download/embed. |
| 5 | Notification deep link | Notification row click navigates to /validasi-lelangan or /lelangan/{id}; mark as read on open; payload supports batchId. |
| 6 | Perubahan Barang | **Confirmed:** FR-246 is covered by the existing validation flow: auction staff use "Tolak" with rejection reason and evidence photos (validationNotes, validationPhotos) to record condition changes; no dedicated "Perubahan Barang" form required. |
| 7 | Notification scope | Backend filters notifications by recipientId (user); frontend deep link and mark-as-read implemented. |
| 8 | Validasi Lelangan tab mapping | **Documented:** Three tabs — Dijadwalkan (draft/pickup_in_progress), Waiting for Approval (validation_pending), Tervalidasi (ready_for_auction). See auction-staff-validation.md FR-243. |

---

*Source: Plan "Staff Marketing and Staff Lelang User Stories"; specs in feature_specifications/auction, reports, auth.*
