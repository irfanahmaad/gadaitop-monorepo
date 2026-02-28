# FR‑026 Master Toko – Tab "Toko Utama" (Admin PT) with Optional Pinjam PT

## Feature Name
Master Toko – Main Store Management ("Toko Utama") for Admin PT

## Description
The system provides a **“Toko Utama”** tab under Master Toko where **Admin PT** manages main stores (official branches) that belong to their own PT.  
When creating or editing a main store, Admin PT can optionally fill the field **“Pinjam PT (Opsional)”**:

- If left empty, the store is only a main store of the current PT.  
- If filled with another PT, the system also creates a **borrow request** so that the selected PT can use this store as a **Borrowed Store**, which must first be **approved or rejected** in the **Request** tab of the target Admin PT.

This FR covers:

- View Toko Utama list  
- Create main store (+ optional Pinjam PT request)  
- View Detail  
- Edit main store (+ optional Pinjam PT change)  
- Single delete  
- Bulk delete

## Actor
- Admin PT

## Priority
High

---

## Global Preconditions

1. User is logged in as **Admin PT** and has an active session.  
2. Admin PT is linked to exactly one PT (called **Current PT**).  
3. Admin PT has permission to access **Master Data → Master Toko → Tab Toko Utama**.

---

## Global Postconditions

1. Admin PT can end‑to‑end manage main stores for **Current PT**.  
2. When **Pinjam PT (Opsional)** is filled:
   - A corresponding **borrow PT request** is created or updated and will appear in the **Request tab** of the selected target PT’s Admin PT for approval or rejection.

---

## FR‑026.1 View Main Store List (Toko Utama)

### Description
Defines the behaviour of **“Daftar Toko Utama”** table for Admin PT.

### UI & Interaction Requirements

#### Tab & Header
- On opening Master Toko, tab **“Toko Utama”** is visible and selected.  
- Header:
  - Title: **“Master Toko”**.  
  - Subtitle/breadcrumb: `Pages / Master Toko`.  
  - Right header button: **“+ Tambah Data”**.

#### Toolbar above Table
- Rows‑per‑page dropdown (as shown in Figma).  
- Search field (e.g., “Cari Nama Toko, Kode Lokasi, Alamat, atau No. Telepon”).  
- **Filter** button (for additional filters such as city; details can be elaborated later).

#### Table "Daftar Toko Utama"
Columns as in the screenshot:

1. Checkbox (for selection).  
2. Store avatar/icon.  
3. **Kode Lokasi**.  
4. **Nama PT** (always Current PT for this Admin PT, but displayed).  
5. **Nama Toko**.  
6. **Alamat** (short).  
7. **No. Telepon**.  
8. **Kota**.  
9. **Action** (three‑dot menu).

Row behaviour:

- Clicking cells does not navigate.  
- Action menu options:
  - **Detail** – open detail page (FR‑026.3).  
  - **Edit** – open edit page (FR‑026.4).  
  - **Delete** – open delete confirmation (FR‑026.5).

#### Pagination & States
- Bottom-left: “Showing X–Y of Z results”.  
- Bottom-right: Previous / page numbers / Next.  
- Loading, Empty, and Error states as previously described.

### Data & Behaviour Requirements

- Scope:
  - Only stores where `ownerPtId = Current PT` and `type = MAIN` are shown.  
- List API parameters:
  - `ptId = Current PT`, `type = MAIN`, `page`, `pageSize`, `search`, optional filters.  
- Search and pagination behaviour unchanged from previous version.

---

## FR‑026.2 Create Main Store (Tambah Data with Pinjam PT Optional)

### Description
Admin PT can create a new main store for **Current PT** from Toko Utama.  
The form includes **Pinjam PT (Opsional)**; if filled, the system additionally creates a **borrow PT request** for the selected PT.

### UI & Interaction Requirements

#### Navigation
- Clicking **“+ Tambah Data”** opens the **Tambah Data** page.  
- Section title: **“Data Toko”**.

#### Form Layout – Fields (from Figma + RS)

- **Kode Lokasi** * – text.  
- **Nama Toko** * – text.  
- **Nama PT** – read-only label showing **Current PT**.  
- **No. Telepon** * – text.  
- **Kota** * – text/dropdown.  
- **Alamat** * – multiline text.  
- **Pinjam PT (Opsional)** – dropdown:
  - Default: empty (“–” / “Tidak pinjam PT”).  
  - Options: list of PTs other than Current PT that are allowed to borrow this store.

Buttons:

- **Batal** – cancel; if there are unsaved changes, show confirmation.  
- **Simpan** – validate and send data to backend.

#### Validation

- Required fields: Kode Lokasi, Nama Toko, No. Telepon, Kota, Alamat.  
- **Pinjam PT (Opsional)** can be left empty.  
- If filled:
  - Selected PT must be different from Current PT.  
- Kode Lokasi must be unique for Current PT.

#### Feedback

- On success:
  - Show success modal (e.g., “Sukses! Data Toko Utama berhasil disimpan”).  
  - After closing modal, return to Toko Utama list and show new store row.  

### Data & Behaviour Requirements

- When Admin PT clicks **Simpan**, frontend sends create payload containing:
  - `ownerPtId = Current PT`.  
  - `kodeLokasi`, `namaToko`, `alamat`, `kota`, `noTelepon`.  
  - Optional `pinjamPtId` from **Pinjam PT (Opsional)** field.

- Backend behaviours:
  1. **Store creation**
     - Create a main store record linked to `ownerPtId = Current PT`.  
  2. **Borrow PT Request (if pinjamPtId is provided)**
     - Create a **Request entry** with:
       - reference to the newly created store,  
       - `requestTargetPtId = pinjamPtId`,  
       - `requestStatus = Pending`.  
     - This Request must appear later in the **Request tab** when an Admin PT from `requestTargetPtId` logs in.

### Security & Business Rules

- Admin PT cannot change `ownerPtId`; it is always Current PT.  
- Pinjam PT is optional; no Request is created when it is left empty.  
- RS for Request tab will define how target Admin PT approves/rejects; here we only ensure the request is created.

### Acceptance Criteria

- The **Tambah Data** form always shows **Pinjam PT (Opsional)**.  
- Saving with Pinjam PT empty:
  - Creates a main store visible in Toko Utama list.  
  - Does not create any Request.  
- Saving with Pinjam PT filled:
  - Creates the main store in Toko Utama list.  
  - Creates a Pending Request that will appear in the Request tab for the selected PT’s Admin PT.

---

## FR‑026.3 View Main Store Detail (includes Pinjam PT information)

### Description
Detail page shows full information of a main store, including whether it has **Pinjam PT** request(s).

### UI & Interaction Requirements

- Detail page shows:
  - Store avatar.  
  - Kode Lokasi.  
  - Nama Toko.  
  - Nama PT (Current PT).  
  - No. Telepon.  
  - Kota.  
  - Alamat.  
  - **Pinjam PT (Opsional)**:
    - If store has an active or pending Pinjam PT request, show the target PT name and request status (Pending / Approved / Rejected).  
    - If none, show “–” or “Tidak pinjam PT”.

- Top-right buttons:
  - **Edit** – opens Edit Data (FR‑026.4).  
  - **Kembali** – returns to Toko Utama list.

### Data & Behaviour Requirements

- On load, backend returns store details and, if applicable, the last or current Pinjam PT request meta (target PT, status).  

### Acceptance Criteria

- Detail page clearly indicates whether and to which PT the store is being borrowed and the status of that request.

---

## FR‑026.4 Edit Main Store (Update Toko Utama + Pinjam PT Opsional)

### Description
Admin PT can update existing main store data and optionally change **Pinjam PT (Opsional)**.

### UI & Interaction Requirements

- Navigation:
  - From list Action menu → Edit.  
  - From Detail page → Edit button.

- Page title: **“Edit Data”**.  
- Section title: **“Data Toko”**.  
- Fields identical to Tambah Data, pre-filled:

  - Kode Lokasi *  
  - Nama Toko *  
  - Nama PT (read-only Current PT)  
  - No. Telepon *  
  - Kota *  
  - Alamat *  
  - **Pinjam PT (Opsional)** – dropdown:
    - Current value set to previously selected PT if any; otherwise empty.

- Buttons:
  - **Batal** – if there are changes, show confirmation before discarding.  
  - **Simpan** – validate and update.

### Data & Behaviour Requirements

- On **Simpan**, backend:

  1. Updates store fields (Kode Lokasi, Nama Toko, etc.).  
  2. Handles **Pinjam PT (Opsional)**:
     - If previously empty and now filled:
       - Create new Pending Request for the selected PT.  
     - If previously filled with PT A and now changed to PT B:
       - Option A (recommended simplification): close/mark old request as Cancelled (if still pending) and create new Pending Request to PT B.  
     - If previously filled and now cleared:
       - Cancel/close any existing pending request related to that PT.  
       - If already approved earlier, behaviour is defined in Request/Borrowed PT FR (e.g., may require that borrowed store explicitly be revoked).  

*(The exact lifecycle of Requests and approvals will be fully detailed in the Request-tab FR; here we only require that edits correctly trigger or revoke requests.)*

### Acceptance Criteria

- Edit form always shows **Pinjam PT (Opsional)**.  
- Changing Pinjam PT results in correct creation/update/cancellation of Request entries.  
- Editing other fields updates them correctly in list and Detail view.

---

## FR‑026.5 Delete Main Store (Single Delete)

### Description
Admin PT can delete a single main store from Toko Utama.  

### UI & Interaction Requirements

- From Action menu → **Delete**.  
- Confirmation modal:
  - Title: “Apakah Anda yakin?”.  
  - Message: explains that this Toko Utama will be removed.  
  - Buttons: **Batal**, **Hapus**.

- After confirming:
  - If delete succeeds:
    - Show success modal.  
    - Remove row from Toko Utama list.  
  - If delete fails (e.g., store has active transactions):
    - Show error message with reason.

### Data & Behaviour Requirements

- Delete operation is soft delete (flag or status); record remains in DB.  
- Any pending/approved Pinjam PT requests linked to this store must be handled according to Request‑module rules (likely marked Cancelled or no longer valid).

### Acceptance Criteria

- Single delete removes the store from Toko Utama list for Admin PT and does not break layout.

---

## FR‑026.6 Bulk Delete Main Stores

### Description
Admin PT can delete multiple main stores at once from Toko Utama using checkboxes.

### UI & Interaction Requirements

- Admin PT selects multiple rows via checkboxes.  
- A bulk action bar appears showing “X Selected” and a red **“Hapus”** button.  
- Clicking **“Hapus”** brings the same confirmation pattern but with wording for multiple stores.  

### Data & Behaviour Requirements

- Bulk delete API accepts multiple store IDs and soft‑deletes allowed ones.  
- For each store:
  - Same constraints as single delete (no active transactions, etc.).  
- Partial success:
  - Successfully deleted stores vanish from list.  
  - For failed ones, system shows which ones failed and why.

### Acceptance Criteria

- Bulk delete only affects the selected rows.  
- After bulk delete, pagination and the “Showing X–Y of Z results” summary are updated correctly.

