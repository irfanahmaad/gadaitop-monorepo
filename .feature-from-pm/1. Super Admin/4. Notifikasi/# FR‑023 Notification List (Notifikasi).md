# FR‑023 Notification List (Notifikasi)

## Feature Name
Notification List (Daftar Notifikasi)

## Description
The system provides a “Notifikasi” page that displays a paginated list of system notifications for the current CMS user, following the Figma layout: header with title and “Kembali” button, table “Daftar Notifikasi” with No, Nama Notifikasi, Keterangan, Tanggal & Waktu, plus search, filter, and page size controls.

## Actor
- Super Admin (Owner)  
- Super Admin  


## Priority
High  

---

## Preconditions
- User is logged into CMS with an active session.  
- User navigates to the “Notifikasi” page via menu entry or a “Lihat Semua Notifikasi” link.  
- Notification service/API is reachable.  

---

## Postconditions
- The user sees a list of notifications relevant to their account, ordered by time (newest first by default).  
- Pagination, search, and filter states can be maintained while user navigates within the page.  
- Notification reads can optionally be logged (if business wants read tracking).

---

## UI & Interaction Requirements

### Page Layout
- Standard CMS layout with:
  - Left sidebar (Dashboard, Master Data, etc.) while the current page title at top center is “Notifikasi”.  
  - Top‑right header section shows the user profile.  
- Header bar inside content:
  - Title: “Notifikasi”.  
  - Secondary button “Kembali” on the right to navigate back to previous page or Dashboard.  

### Toolbar Above Table
- Page size dropdown on the left: default value (e.g., 10 or 100) matching Figma; options such as 10, 25, 50, 100.  
- Search field on the right with placeholder (e.g., “Cari nama notifikasi atau keterangan”).  
- Optional “Filter” button next to search to open advanced filter panel (e.g., by date range, type, read/unread).  

### Table Layout
- Section title: “Daftar Notifikasi”.  
- Columns:
  1. No (sequential number).  
  2. Nama Notifikasi.  
  3. Keterangan.  
  4. Tanggal & Waktu.  
- Behaviour:
  - Rows are read‑only; clicking a row does not navigate to another page unless in the future a detail view is defined.  
  - Text in “Nama Notifikasi” and “Keterangan” can wrap or truncate based on design tokens, but full content should be visible via tooltip or multi‑line cell to avoid losing context.  
- No checkbox or Action menu is shown in current design (not a bulk‑action list).  

### Pagination & Result Summary
- Bottom‑left: “Showing X–Y of Z results” (1–100 of 100 etc.).  
- Bottom‑right: pagination controls:
  - “Previous” button, page numbers, “Next” button with active page highlighted, as in Figma.  

### States
- Loading: skeleton or spinner within table body while notifications are being fetched.  
- Empty: if no notifications, show message such as “Belum ada notifikasi untuk Anda.”  
- Error: if API fails, show banner “Tidak dapat memuat notifikasi. Coba lagi.” and “Coba Lagi” button.

---

## Data & Behavior Requirements

### Data Shown Per Row
- `No`: computed as `(currentPageIndex × pageSize) + rowIndex + 1`.  
- `Nama Notifikasi`: short title/subject of the notification.  
- `Keterangan`: body text or brief description.  
- `Tanggal & Waktu`: timestamp when the notification was created or delivered to this user (localised to user timezone).  

### Loading & Pagination
- Frontend calls notification API with parameters:
  - `page`, `pageSize`, `search`, `filters`, `sortBy = createdAt`, `sortDirection = desc`.  
- When user changes page, list reloads with new `page` while keeping search/filter terms.  
- When pageSize changes, the list reloads and resets to `page = 1`.  

### Search Behavior
- Keyword search applies to at least `namaNotifikasi` and `keterangan`.  
- Triggered when user presses Enter or clicks search icon.  
- Clearing search resets list and pagination to defaults.  

### Filter Behavior (if implemented)
- Filter panel may include:
  - Date range (from–to).  
  - Notification type (e.g., “SPK Jatuh Tempo”, “Setor Uang”, “System Alert”).  
  - Status (read/unread).  
- Applying filter reloads list, resets pagination to page 1, and updates result summary.  

### Optional Read Tracking
- When user opens the Notifikasi page, all currently visible notifications can be marked as “read” or only explicitly clicked ones, depending on the rule chosen.  
- If read state is implemented, unread notifications should still display a distinct visual (e.g., bold text or dot), even on this list page.

---

## Security & Business Rules
- Users only see notifications that belong to them or to entities they are allowed to manage (e.g., per PT/cabang).  
- Backend must enforce access control so one user cannot see notifications of another tenant/owner.  
- No sensitive data such as passwords, tokens, or internal system secrets may appear in notification text.  
- Notification retention policy (how long entries are kept) is handled by backend configuration.  

---

## Acceptance Criteria
- Opening the “Notifikasi” page shows the header, toolbar (page size, search, filter button), and “Daftar Notifikasi” table with columns No, Nama Notifikasi, Keterangan, and Tanggal & Waktu, matching the Figma layout.  
- Pagination and “Showing X–Y of Z results” reflect the correct slice and total based on backend data.  
- Entering a search term and submitting filters notifications by name/description; clearing search returns full list.  
- If there are no notifications, an empty state message appears and pagination controls are hidden or disabled appropriately.  
- Any API failures result in a clear error message and the ability to retry without breaking the page layout.  
