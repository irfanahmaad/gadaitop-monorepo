# FR‑028 Master Toko – Tab "Request" (Admin PT)

## Feature Name
Master Toko – Borrowed Store Requests ("Request") for Admin PT

## Description
The **“Request”** tab under Master Toko shows a list of **incoming requests from other PTs** that want to:

- Borrow a store owned by the current PT (Pinjam PT), or  
- Transfer store ownership (Pindah Kepemilikan), depending on the request type.

From this tab, the **Admin PT of the target PT** can:

- View all pending requests.  
- Approve or reject each request.  
- Approve or reject multiple requests at once (bulk).  

Approved Pinjam PT requests will make the store appear as **Toko Pinjaman** in the requester PT.  
Rejected requests will not change any relationships.

## Actor
- Admin PT (as **Target PT Admin**, i.e., PT that receives the request)

## Priority
High

---

## Preconditions

1. User is logged in as Admin PT and belongs to a PT that can receive requests.  
2. There are Pending requests where `targetPtId = current Admin PT’s PT`.  
3. Requests have been created by other PTs through the **Pinjam PT (Opsional)** field or Pindah Kepemilikan flow on their side.

---

## Postconditions

1. Admin PT can see all relevant requests targeted to their PT.  
2. Admin PT can mark requests as **Approved** or **Rejected**, for single or multiple selected rows.  
3. Approved Pinjam PT requests create/update Borrowed Store relationships (thus populating Toko Pinjaman for requester PT).  
4. Rejected requests do not create/continue the borrowing relationship.

---

## UI & Interaction Requirements

### Tab & Header

- In Master Toko, the third tab is **“Request”**.  
- When Admin PT clicks this tab:
  - Page title remains **“Master Toko”**.  
  - Sub‑tab highlight moves to **Request**.  
- Right header button **“+ Tambah Data”** is still shown (shared header component), but the core function of this tab is **approving/rejecting** requests rather than creating new stores.

### Toolbar

- Rows‑per‑page dropdown (e.g., 10, as per Figma).  
- Search input (e.g., “Cari berdasarkan Kode Lokasi, Nama PT, Admin PT, Nama Toko, dsb.”).  
- **Filter** button for additional filters (such as request type / status if required later).

### Table "Daftar Request"

Header label: **“Daftar Request”**.

Columns displayed in screenshot (left → right):

1. Checkbox (row selection).  
2. Photo (avatar – likely the Admin requesting, or PT logo).  
3. **No.** – running number.  
4. **Kode Lokasi** – store location code from the requester PT’s data.  
5. **Nama PT** – PT name that **sent** the request (Requester PT).  
6. **Admin Primary** – primary admin name of the Requester PT or requesting Admin.  
7. **Nama Toko** – name of the store being requested.  
8. **Alias** – alias name suggested in this request for use by the target PT (e.g., view in Borrowed list).  
9. **No. Telepon** – store phone number.  
10. **Kota** – city of the store.  
11. **Type** – request type, for example:
    - “Pindah Kepemilikan” (ownership transfer), or  
    - “Pinjam PT” (borrow PT).

12. **Action** – three‑dot menu per row.

Row behaviour:

- Clicking cells does not navigate.  
- Action menu provides per‑row actions:
  - **Setuju** / **Approve** – approve request.  
  - **Tolak** / **Reject** – reject request.

Below the table (bottom left), Figma shows:

- Two buttons: **“Setujui”** (Approve) and **“Tolak”** (Reject) – used for **bulk action** when multiple rows are selected.

### Pagination & States

- Bottom-left: “Showing X–Y of Z results”.  
- Bottom-right: Previous / page numbers / Next.  
- Loading, Empty, Error:
  - Loading skeleton/spinner.  
  - Empty message: “Belum ada Request untuk PT ini.”  
  - Error message + Retry.

---

## Data & Behaviour Requirements

### Data Scope

- Request tab shows **only** requests where:
  - `targetPtId = current Admin PT’s PT`, and  
  - `status = Pending` (by default).  
- Requests with status Approved/Rejected may be hidden or filterable depending on final requirement (default view is pending).

### List Loading

- On opening Request tab, frontend calls list endpoint with:
  - `targetPtId`, `status=Pending`, `page`, `pageSize`, `search`, optional filters.

### Search & Filter

- Search term is matched against:
  - Kode Lokasi, Nama PT (requester), Admin Primary, Nama Toko, Alias, No. Telepon, Kota.  
- Filters from Filter button (e.g., request type = Pindah Kepemilikan / Pinjam PT).

---

## FR‑028.1 Approve Single Request

### Description
Admin PT can **approve** one request using the Action menu.

### UI & Interaction Requirements

- From row’s Action menu, Admin PT chooses **“Setujui”** (Approve).  
- A confirmation modal appears (per Figma at bottom left):
  - Title: **“Apakah Anda Yakin?”**.  
  - Message: explains that Admin PT will approve the selected Toko Request.  
  - Buttons:
    - **Batal**.  
    - **Ya** (primary red).

- On clicking **Ya**:
  - Show loading state in modal or disable buttons.  

- After successful approval:
  - Show success modal: **“Sukses! Data berhasil disimpan.”** (or similar text from Figma).  
  - The approved request row is removed from the “Daftar Request” table (at least from the Pending filter).  

### Data & Behaviour Requirements

- Frontend sends approve request:
  - `POST /store-requests/{requestId}/approve` or similar.  
- Backend behaviour on **Pinjam PT** type:
  - Set `status = Approved`.  
  - Create/activate a **Borrowed Store** relationship:
    - `borrowerPtId = requesterPtId`.  
    - `ownerPtId = currentPT`.  
    - Store reference (existing store of current PT).  
    - Optional alias stored for Borrower PT.  
  - So that this store appears under **Toko Pinjaman** tab for **requester PT**.  

- Backend behaviour on **Pindah Kepemilikan** type:
  - Set `status = Approved`.  
  - Execute ownership transfer logic (store’s ownerPtId changed to requester PT, or create a new record accordingly), as specified in separate Ownership Transfer FR.

### Acceptance Criteria

- Approving a request via Action menu:
  - Shows confirmation modal.  
  - On confirm, makes the request disappear from Pending list.  
  - For Pinjam PT requests, the corresponding store appears in Toko Pinjaman of requester PT.  

---

## FR‑028.2 Reject Single Request

### Description
Admin PT can **reject** one request using the Action menu.

### UI & Interaction Requirements

- From row’s Action menu, Admin PT selects **“Tolak”** (Reject).  
- Confirmation modal (bottom left second flow in Figma):
  - Title: “Apakah Anda Yakin?”.  
  - Message: explains that the Request will be rejected.  
  - Buttons: **Batal**, **Ya**.

- On success:
  - Show success modal: “Sukses! Data berhasil disimpan.”  
  - Remove the rejected request row from Pending list.

### Data & Behaviour Requirements

- Frontend calls reject endpoint `POST /store-requests/{requestId}/reject`.  
- Backend sets `status = Rejected` and does **not** create/update any borrow or ownership relationships.

### Acceptance Criteria

- Rejected request no longer appears in “Daftar Request” under Pending filter.  
- No borrowed store or ownership transfer is created.

---

## FR‑028.3 Bulk Approve Requests

### Description
Admin PT can **approve multiple requests at once**.

### UI & Interaction Requirements

- Admin PT selects multiple rows via checkboxes.  
- At bottom left, the buttons **“Setujui”** and **“Tolak”** become active.  
- When Admin PT clicks **“Setujui”**:
  - Confirmation modal:
    - Title: “Apakah Anda Yakin?”.  
    - Message: e.g., “Anda akan menyetujui X Request Pinjam Toko.”  
    - Buttons: **Batal**, **Ya**.

- After confirm:
  - On full success:
    - Show success modal: “Sukses! Data berhasil disimpan.”  
    - Remove all approved rows from table.  
  - On partial failure:
    - Successfully approved rows are removed.  
    - System shows which request IDs failed and why.

### Data & Behaviour Requirements

- Frontend calls bulk approve endpoint with list of request IDs.  
- Backend:
  - Marks each as Approved.  
  - For each Pinjam PT request, creates/updates Borrowed Store relationships as described above.  

### Acceptance Criteria

- Bulk approve is only enabled when at least one request is selected.  
- After bulk approve, the list and pagination summary (“Showing X–Y of Z results”) are updated correctly.

---

## FR‑028.4 Bulk Reject Requests

### Description
Admin PT can **reject multiple requests at once**.

### UI & Interaction Requirements

- Similar to Bulk Approve, but user clicks **“Tolak”**.  
- Confirmation modal states that X requests will be rejected.  
- After confirm, success modal appears and selected requests are removed.

### Data & Behaviour Requirements

- Bulk reject endpoint sets `status = Rejected` for all given IDs.  

### Acceptance Criteria

- Bulk reject works only on selected rows and does not create any borrowed store or ownership transfer.  

---

## Security & Business Rules (Request Tab)

1. Admin PT can see and act only on requests where their PT is **target PT**.  
2. The Request list should not expose sensitive internal IDs beyond what is needed to identify PTs and stores.  
3. Approve/Reject actions should be logged in audit trail (user, PT, request ID, timestamp, decision).  
4. Once Approved/Rejected, a request cannot be approved/rejected again; further actions (like revoke) are handled from Toko Pinjaman or other dedicated flows.

