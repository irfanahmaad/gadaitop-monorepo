# FR‑027 Master Toko – Tab "Toko Pinjaman" (Admin PT)

## Feature Name
Master Toko – Borrowed Store List ("Toko Pinjaman") for Admin PT

## Description
The system provides a **“Toko Pinjaman”** tab under Master Toko where an **Admin PT** can see all **stores borrowed from other PTs** that have already been approved.  
From this tab, Admin PT can:

- View and search the list of borrowed stores.  
- Revoke the borrowing relationship for one or multiple stores (so the store is no longer used as a borrowed store by this PT).

Ownership of the store stays with the original PT; this tab shows only the borrowing side.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. User is logged in as Admin PT and has an active session.  
2. Admin PT is associated with a PT (called **Borrower PT** in this FR).  
3. There is at least one store from other PTs that has an **Approved Pinjam PT request** targeting this Borrower PT.

---

## Postconditions

1. Admin PT can see all currently approved **borrowed stores** for their PT.  
2. Admin PT can revoke the borrowing relationship for one or more stores; revoked stores disappear from this tab and are no longer treated as borrowed stores by this PT.

---

## UI & Interaction Requirements

### Tab & Header

- In Master Toko, the second tab is **“Toko Pinjaman”**.  
- When Admin PT clicks this tab:
  - Page header remains **“Master Toko”**.  
  - Sub‑tab highlight changes from “Toko Utama” to **“Toko Pinjaman”**.  
- Header right button **“+ Tambah Data”** is still visible, but adding a store from here will open the same “Tambah Data” main store form (use is mainly from Toko Utama; business can decide whether to allow it here or not).

### Toolbar Above Table

From the Figma “Toko Pinjaman”:

- Rows‑per‑page dropdown (e.g., “10”).  
- Search field (placeholder similar to: “Cari Toko Pinjaman …”).  
- **Filter** button.

### Table "Daftar Toko Pinjaman"

Header label: **“Daftar Toko Pinjaman”**.

Columns seen in the screenshot (left → right):

1. Checkbox (row selection).  
2. Photo (store avatar).  
3. **Kode Lokasi**.  
4. **Nama PT** – the **owner PT** (PT where the store originates).  
5. **Nama Toko**.  
6. **Alias** – local alias name for the store as used by the Borrower PT (e.g., “GT Dua”).  
7. **No. Telepon Toko**.  
8. **Kota**.  
9. **Action** (three‑dot menu).

Row behaviour:

- Each row represents one **borrowed store** that this Borrower PT currently has access to.  
- Clicking cells does not navigate; all actions are via the Action menu.  
- From the screenshot and sticky note:
  - The main row‑level action is **Revoke** (to stop using this borrowed store).

### Revoke Control Section

- At the bottom left of the page (under the table) there is a label/button **“Revoke”** (visible when at least one row is selected).  
- When Admin PT selects rows with the checkbox, this Revoke control becomes the bulk action trigger.

### Pagination & States

- Bottom-left: “Showing X–Y of Z results”.  
- Bottom-right: Previous / page numbers / Next controls.  
- Loading, Empty, and Error states are consistent with other Master Toko tabs:
  - Loading: skeleton/spinner.  
  - Empty: message like “Belum ada Toko Pinjaman”.  
  - Error: message + Retry.

---

## Data & Behaviour Requirements

### Data Scope

- Toko Pinjaman tab lists stores where:
  - `borrowerPtId = Borrower PT`, and  
  - `borrowStatus = Approved` (Pinjam PT request has been approved by the owner PT).  
- It **must not** show:
  - Main stores owned by Borrower PT itself (those are in Toko Utama).  
  - Requests that are still Pending or Rejected (those appear in Request tab, not here).

### List Loading

- When Toko Pinjaman tab is opened, frontend calls a list endpoint like:
  - `GET /borrowed-stores?ptId=<BorrowerPT>&status=Approved&page=1&pageSize=<default>&search=&filters=…`  
- Search:
  - Keyword is matched against at least: Kode Lokasi, Nama PT, Nama Toko, Alias, No. Telepon, Kota.  
- Filters:
  - From Filter button (e.g., city filter).  
- Pagination:
  - Works the same as in Toko Utama.

---

## FR‑027.1 Revoke Borrowed Store (Single Revoke)

### Description
Allows Admin PT to revoke the borrowing relationship for a single borrowed store from Toko Pinjaman.

### UI & Interaction Requirements

- From each row’s Action menu, Admin PT chooses **“Revoke”** (label based on sticky note).  
- A confirmation modal appears (as shown in bottom Figma modal set):
  - Title: **“Apakah Anda Yakin?”**.  
  - Message: explains that the borrowing access for this store will be revoked for this PT.  
  - Buttons:
    - **Batal**.  
    - **Ya** / **Revoke** (primary red).

- After confirming:
  - On success:
    - Show success modal: “Sukses! Toko Pinjaman berhasil direvoke.”  
    - Remove the store row from the Toko Pinjaman table.  
  - On failure:
    - Show error message with reason (e.g., backend constraint).

### Data & Behaviour Requirements

- Frontend sends a revoke request:
  - `POST /borrowed-stores/{borrowId}/revoke` or equivalent, including Borrower PT and store ID.  
- Backend behaviour:
  - Changes `borrowStatus` for this relationship to `Revoked`.  
  - After revocation, this store must **no longer appear** in Toko Pinjaman tab for this Borrower PT.  
  - The original main store under the owner PT remains unaffected in their Toko Utama.

### Security & Business Rules

- Only the **Borrower PT’s Admin PT** can revoke the borrowed relationship.  
- Owner PT cannot revoke from this tab (they may have their own way to revoke in owner context).  

### Acceptance Criteria

- Revoke action shows confirmation before applying.  
- After revoke, the store disappears from Toko Pinjaman list for that Admin PT.  

---

## FR‑027.2 Bulk Revoke Borrowed Stores

### Description
Allows Admin PT to revoke multiple borrowed stores at once from Toko Pinjaman.

### UI & Interaction Requirements

- Admin PT selects multiple rows using the checkboxes in the first column.  
- At the bottom left, the **Revoke** control becomes active, displaying something like “Revoke X Toko” (text can follow Figma).  
- When the Admin PT clicks **Revoke**:
  - Confirmation modal appears:
    - Title: **“Apakah Anda Yakin?”**.  
    - Message: clearly states that the system will revoke borrowing access for X selected stores.  
    - Buttons: **Batal**, **Ya** / **Revoke**.

- After confirm:
  - On full success:
    - Show success modal: “Sukses! Toko Pinjaman berhasil direvoke.”  
    - All selected rows are removed from the list.  
  - On partial failure:
    - Successfully revoked stores are removed.  
    - For failed ones, system shows which ones could not be revoked and why.

### Data & Behaviour Requirements

- Frontend calls bulk revoke endpoint with list of selected borrowed store IDs.  
- Backend soft‑updates all corresponding borrowed relationships to status `Revoked`.

### Acceptance Criteria

- Bulk revoke is only enabled when one or more rows are selected.  
- After bulk revoke, pagination and “Showing X–Y of Z results” summary are updated correctly.  

---

## Security & General Business Rules (Tab Toko Pinjaman)

1. Admin PT sees only borrowed stores where their PT is **Borrower PT** and the borrow status is **Approved**.  
2. Revoking a borrowed store does not delete the original store; it only removes the borrowing link.  
3. All revoke actions (single & bulk) should be logged for audit (user, PT, store, timestamp).  

