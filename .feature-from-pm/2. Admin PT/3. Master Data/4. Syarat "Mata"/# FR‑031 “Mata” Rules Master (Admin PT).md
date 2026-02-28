# FR‑031 “Mata” Rules Master (Admin PT)

## Feature Name
“Mata” Rules Master – Priority Rules Management for Stock Opname

## Description
The system provides a **“Master Syarat ‘Mata’”** page where **Admin PT** manages rules that mark pledged items as **priority (“mata”)** for Stock Opname.  
From this page, Admin PT can view, filter, create, edit, and delete “mata” rules which will later be used to highlight items that must be checked physically in Stock Opname.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. The user is logged in as Admin PT and has permission to access **Master Data → Master Syarat “Mata”**.  
2. The Admin PT is associated with exactly one PT in the system.  
3. “Mata” rules for this PT may or may not exist (empty state supported).  

---

## Postconditions

1. The list of “mata” rules for the PT is updated according to Admin PT actions.  
2. Active “mata” rules are used by the Stock Opname module to mark priority items in Stock Opname scopes.  

---

## FR‑031.1 View “Mata” Rules List

### Description
Defines how Admin PT views and filters “mata” rules on the **Master Syarat “Mata”** page.

### UI & Interaction Requirements

#### Header & Toolbar

- Page header:
  - Title: **“Master Syarat ‘Mata’”**.
  - Breadcrumb under the title follows `Pages / Master Syarat "Mata"`.
- Top‑right header button:
  - **“+ Tambah Data” / “+ Add Data”** to open the Add Rule form (FR‑031.2).

Above the table:

- **Rows per page** dropdown (10 / 25 / 50 / 100).  
- **Filter** button to open the filter panel below the table.  

#### “Daftar Katalog” Table

- Table label: **“Daftar Katalog”**.  
- Each row represents one “mata” rule.  
- Columns (following the Figma screen):

  1. **Nama Syarat “Mata”** – name of the rule (e.g., “Barang Mahal”).  
  2. **Tipe Barang** – item type, from Master Tipe Barang.  
  3. **Harga Dari** – minimum loan/price value used in the rule.  
  4. **Harga Sampai Dengan** – maximum loan/price value used in the rule.  
  5. **Kondisi Barang** – item condition criterion selected for this rule.  
  6. **Last Updated** – last updated date/time.  
  7. **Action** – three‑dot menu.

- Row behaviour:
  - Clicking the row does not navigate.
  - **Action** menu contains:
    - **Detail** – opens rule detail page (FR‑031.3).
    - **Edit** – opens edit rule page (FR‑031.2, edit mode).
    - **Delete** – opens delete confirmation (FR‑031.4).

#### Filter Panel

- Appears below the table when **Filter** is active.
- Fields (exactly as visible in the filter screenshot):

  - **Last Update Mulai Dari** – date.  
  - **Sampai Dengan** – date.  
  - **Harga Dari** – numeric/currency.  
  - **Sampai Dengan** – numeric/currency.  
  - **Tipe Barang** – dropdown.

- Buttons:

  - **Tutup** – close the filter panel.  
  - **Reset** – clear all filters and reload list.  
  - **Terapkan** – apply filters and reload list from page 1.  

#### Pagination & States

- Bottom‑left: text such as “Showing X–Y of Z results”.  
- Bottom‑right: **Previous / page numbers / Next** buttons.  
- **Loading**: skeleton/spinner while data is fetched.  
- **Empty**: message such as “Belum ada syarat ‘Mata’” when no data is available under current filter.  
- **Error**: inline error message with **Retry** control when loading fails.  

### Data & Behaviour Requirements

- Scope:
  - Only “mata” rules belonging to the current Admin PT’s PT are shown.  
- Filters:
  - Date fields filter by **Last Updated** value.
  - **Harga Dari / Sampai Dengan** filter rules by their configured price/loan range.
  - **Tipe Barang** filters rules by item type.
- Pagination:
  - List API accepts `page`, `pageSize`, and filter parameters.

### Security & Business Rules

- Admin PT cannot see or manage “mata” rules from other PTs.  
- There is no hard delete at database level; deleted rules are soft‑deleted or flagged.

### Acceptance Criteria

- Table columns and labels match the “Master Syarat ‘Mata’” Figma screen.  
- Filters and pagination behave as expected and never show rules from another PT.  
- Loading, empty, and error states appear correctly.

---

## FR‑031.2 Create & Edit “Mata” Rule (Tambah / Edit Data)

### Description
Allows Admin PT to define or modify a **“Mata”** rule that determines which pledged items are treated as priority in Stock Opname.

### UI & Interaction Requirements

#### Navigation

- **Tambah Data**:
  - Clicking **“+ Tambah Data”** on Master Syarat “Mata” opens the `Master Syarat "Mata" / Tambah Data` page.
- **Edit Data**:
  - From table **Action → Edit** or from detail page **Edit** opens the `Master Syarat "Mata" / Edit Data` page.

#### Header & Section

- Page title:
  - Add mode: **“Tambah Data”**.
  - Edit mode: **“Edit Data”**.
- Section title: **“Detail Syarat ‘Mata’”**.

#### Form Fields

(Use the exact labels and structure from the Tambah Data / Edit Data Figma screens.)

- **Nama Syarat “Mata”** * – text (e.g., “Barang Mahal”).  
- **Tipe Barang** * – dropdown, options taken from Master Tipe Barang.  
- **Harga Dari** * – numeric/currency.  
- **Harga Sampai Dengan** * – numeric/currency.  
- **Kondisi Barang** – dropdown (item condition options as seen in form: e.g., Mulus / Lecet sedikit / Lecet parah).  

Bottom buttons:

- **Batal** – navigate back to Master Syarat “Mata”; if form has unsaved changes, show confirmation modal “Apakah Anda yakin?”.  
- **Simpan** – validate and submit the form.

#### Validation

- Fields marked * are required.  
- **Harga Dari** and **Harga Sampai Dengan**:
  - Must be numeric and ≥ 0.
  - **Harga Dari** must be ≤ **Harga Sampai Dengan**.
- If **Kondisi Barang** is required in design, at least one option must be selected.

#### Feedback

- On successful save (Tambah or Edit):

  - Confirmation dialog as per mockup (if present) followed by a **Sukses** modal (e.g., “Data berhasil disimpan”).  
  - Redirect back to Master Syarat “Mata” and refresh the list so the rule is visible/updated.

- On validation error:

  - Show inline error messages under each invalid field and do not submit data.

### Data & Behaviour Requirements

- On **Tambah**:

  - Backend creates a new “Mata” rule with fields:
    - PT ID (from Admin PT),
    - Nama Syarat “Mata”,
    - Tipe Barang,
    - Harga Dari,
    - Harga Sampai Dengan,
    - Kondisi Barang,
    - createdAt, createdBy.

- On **Edit**:

  - Backend updates those fields for the selected rule and records updatedAt / updatedBy.
  - Existing Stock Opname logic uses the updated rule for generating future “Mata” candidates.

### Security & Business Rules

- PT of the rule is derived from Admin PT and cannot be changed from the form.  
- Only Admin PT may create and edit “Mata” rules for their PT.  
- All create/edit operations must be logged (admin user, timestamp, rule ID).

### Acceptance Criteria

- Adding a valid rule shows the success modal and the rule appears in the list with correct values.  
- Editing a rule updates list and detail views consistently.  
- Invalid submissions do not save and show clear error messages.

---

## FR‑031.3 View “Mata” Rule Detail

### Description
Shows full information of a single “Mata” rule in read‑only mode.

### UI & Interaction Requirements

- Accessed from **Action → Detail** in the Master Syarat “Mata” table.  
- Page header shows the **Nama Syarat “Mata”** (e.g., “Barang Mahal”).  
- Section **“Detail Syarat ‘Mata’”** shows:

  - Nama Syarat “Mata”.  
  - Tipe Barang.  
  - Harga Dari.  
  - Harga Sampai Dengan.  
  - Kondisi Barang.  

- Top‑right buttons:

  - **Edit** – navigates to Edit Data (FR‑031.2).  
  - **Hapus** – opens delete confirmation (FR‑031.4).

### Data & Behaviour Requirements

- Backend returns rule detail for the given rule ID, only if it belongs to the current Admin PT’s PT.  
- If the rule does not exist or does not belong to this PT, show an error (“Data syarat ‘Mata’ tidak ditemukan”) and a link back to Master Syarat “Mata”.

### Acceptance Criteria

- Values on the detail page match those in the list and in the add/edit form.  
- Attempting to open detail of a rule from another PT is rejected.

---

## FR‑031.4 Delete “Mata” Rule (Single & Bulk)

### Description
Admin PT can delete (soft delete) one or more “Mata” rules.

### UI & Interaction Requirements

#### Single Delete

- Triggered from:

  - Table **Action → Delete / Hapus**, or  
  - **Hapus** button on the detail page.

- Confirmation modal:

  - Question text as in the Figma “Apakah Anda yakin?” modal.  
  - Buttons: **Batal** and **Ya**.

- On confirmation and success:

  - Show **Sukses** modal (“Data berhasil dihapus”).  
  - Remove the rule from the list.

#### Bulk Delete

- Each row has a checkbox in the first column.  
- Header checkbox selects/deselects all rows on the current page.  
- When one or more rows are selected:

  - A label like **“X Selected”** is shown above the table, consistent with the Figma screen.  
  - A **Hapus** button for bulk delete becomes active.

- Clicking bulk **Hapus**:

  - Shows the same confirmation modal, mentioning that multiple records will be deleted.  
  - On success, selected rows are removed from the table.

### Data & Behaviour Requirements

- Delete must be implemented as **soft delete** (e.g., a `deleted` flag); physical delete from database is not allowed.  
- Soft‑deleted rules are not used when generating or highlighting “Mata” items in Stock Opname.

### Security & Business Rules

- Admin PT may only delete rules belonging to their own PT.  
- All delete operations (single and bulk) are logged with admin ID, timestamp, and affected rule IDs.

### Acceptance Criteria

- Single and bulk delete flows match the confirmation and success modals in the Figma design.  
- Deleted rules no longer show in the list under default filters and are not applied in subsequent Stock Opname “Mata” calculations.
