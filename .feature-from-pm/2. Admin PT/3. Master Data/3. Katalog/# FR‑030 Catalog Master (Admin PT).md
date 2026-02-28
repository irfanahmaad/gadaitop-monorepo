# FR‑030 Catalog Master (Admin PT)

## Feature Name
Catalog Master – Catalog Management for Admin PT

## Description
The system provides a **“Catalog Master”** page where **Admin PT** manages the reference price list (catalog) for all pawnable items under their PT.  
From this page, Admin PT can view, search, filter, import, create, edit, and delete catalog records while keeping historical price data intact.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. The user is logged in as Admin PT and has permission to access **Master Data → Catalog Master**.  
2. The Admin PT is associated with exactly one PT in the system.  
3. Catalog data for this PT may or may not exist (empty state supported).

---

## Postconditions

1. The catalog list for the PT is up to date according to create, edit, delete, and import actions performed by the Admin PT.  
2. Catalog changes are stored historically so that SPK transactions always use the price that was valid on the transaction date.

---

## FR‑030.1 View Catalog List

### Description
Defines how Admin PT views and filters the catalog list on the **Catalog Master** page.

### UI & Interaction Requirements

#### Header & Toolbar

- Page header:
  - Title: **“Catalog Master”**.
  - Breadcrumb under the title follows `Pages / Catalog Master`.
- Top‑right header actions:
  - **Catalog Date** field (date picker) to view catalog prices as of a specific reference date.
  - **“Import Data”** button to open the catalog import flow (FR‑030.4).
  - **“+ Add Data”** button to open the add catalog form (FR‑030.2).

Above the table:

- **Rows per page** dropdown (10 / 25 / 50 / 100).
- **Filter** button to toggle the filter panel displayed below the table.

#### “Catalog List” Table

- Table header label: **“Catalog List”**, with “Last Updated at [date & time]” information.
- Minimum columns:
  1. **Item Photo** (thumbnail).
  2. **Catalog Code**.
  3. **Catalog Name**.
  4. **Item Type** (refers to Item Type master).
  5. **Price** (reference price for the selected date).
  6. **Last Update** (last modification date for this record).
  7. **Action** (three‑dot menu).

- Row behaviour:
  - Clicking a row does not navigate; all actions are triggered from the **Action** menu.
  - **Action** menu contains at least:
    - **Detail** – opens catalog detail page (FR‑030.3).
    - **Edit** – opens catalog edit page (FR‑030.2, edit mode).
    - **Delete** – opens delete confirmation (FR‑030.5).

#### Filter Panel

- Appears below the table when the **Filter** button is active.
- Minimum filter fields:
  - **Last Update From** (date).
  - **Until** (date).
  - **Price From** (numeric/currency).
  - **Until** (numeric/currency).
  - **Item Type** (dropdown from Item Type master).
  - Additional fields follow sticky‑note requirements if any are defined.
- Buttons:
  - **Close** – hides the panel without changing filters.
  - **Reset** – clears all filters and reloads the full list.
  - **Apply** – applies the filters to the table and resets pagination to the first page.

#### Pagination & States

- Bottom‑left: text such as “Showing X–Y of Z results”.
- Bottom‑right: **Previous / page numbers / Next** controls.
- **Loading** state: skeleton rows or spinner while data is being fetched.
- **Empty** state: message like “No catalog data yet” when no data matches the current search/filter.
- **Error** state: inline error message with a **Retry** control when loading fails.

### Data & Behaviour Requirements

- Data scope:
  - Only catalog entries whose PT equals the current Admin PT’s PT are shown.
- **Catalog Date**:
  - Used as a parameter to display the price that is **effective** on that specific date, based on historical records.
- Search (if provided):
  - Keyword is matched at least against Catalog Name and Catalog Code.
- Filters:
  - Combining last‑update date range, price range, and item type should narrow the list accordingly.
- Pagination:
  - List API accepts `page`, `pageSize`, and all filter/date parameters.

### Security & Business Rules

- Admin PT cannot view catalog items belonging to other PTs.
- There is **no hard delete** for catalog data; deletion only marks records as inactive (soft delete) or similar.

### Acceptance Criteria

- Table structure and header labels match the Figma design of Catalog Master.
- Changing Catalog Date, filters, and pagination correctly updates the displayed data without showing other PT’s catalogs.
- Loading, empty, and error states are shown appropriately.

---

## FR‑030.2 Create & Edit Catalog Item (Add / Edit Catalog Data)

### Description
Allows Admin PT to create new catalog items or edit existing items.

### UI & Interaction Requirements

#### Navigation

- **Add Data**:
  - Clicking **“+ Add Data”** on Catalog Master opens the `Catalog Master / Add Data` page.
- **Edit Data**:
  - From table **Action → Edit** or from the detail page **Edit** button opens `Catalog Master / Edit`.

#### Header & Page Structure

- Page title:
  - Add mode: **“Add Data”**.
  - Edit mode: **“Edit Data”**.
- Main section title: **“Catalog Data”**.

#### Form Fields

- **Item Photo** – image upload control (optional but recommended).
- **Catalog Name** * – text.
- **Item Type** * – dropdown sourced from Item Type master.
- **Price** * – numeric field, displayed in Rupiah format.
- **Discount** section:
  - **Discount Name** – text.
  - **Discount Amount** – numeric field (Rupiah or percentage according to policy; label must reflect the chosen interpretation).
- **Description** – text area for additional notes.

Bottom buttons:

- **Cancel** – returns to Catalog Master; if any changes are unsaved, show confirmation dialog.
- **Save** – validates and submits the form.

#### Validation

- All fields marked * are required.
- **Price** and **Discount Amount** (if filled) must be numeric and ≥ 0.
- The uniqueness rule for Catalog Name + Item Type + effective date follows system policy (for example, no duplicate active entries for the same range).
- In edit mode:
  - Fields are pre‑filled with the selected catalog data.

#### Feedback

- On successful save (add or edit):
  - Show confirmation (“Are you sure?”) if required by design, then on success show a modal like **“Success! Data has been saved.”**.
  - After success, navigate back to Catalog Master and show the new/updated item in the table (considering filters/date).
- On validation error:
  - Show inline error messages under each invalid field.

### Data & Behaviour Requirements

- On **Add** submit:
  - Backend creates a new catalog record with: PT ID (from Admin PT), generated catalog code, name, item type, price, discount (if any), description, and effective‑date metadata.
  - Existing records are not overwritten; this is a new entry in the price history.
- On **Edit** submit:
  - Backend may:
    - Update the same record while keeping historical data in a dedicated history table, or
    - Create a new version (record) and mark the old one as inactive.
- The price used in SPK must always be resolved from catalog history based on the SPK date.

### Security & Business Rules

- PT of a catalog item cannot be changed through the form; it always follows the Admin PT’s PT.
- Only Admin PT can create or edit catalog items for their PT.
- All create/edit operations must be logged in an audit trail including user, timestamp, and before‑after values.

### Acceptance Criteria

- Creating a valid catalog item shows success feedback and the item appears in the list according to current filters/date.
- Editing a catalog item updates the data without corrupting or losing historical prices used in SPKs.
- Validation errors are clearly shown and prevent saving.

---

## FR‑030.3 View Catalog Detail

### Description
Shows detailed information of a single catalog item in read‑only mode.

### UI & Interaction Requirements

- Accessed from **Action → Detail** in the Catalog Master table.
- Page header shows the **Catalog Name** (for example, “iPhone 15 Pro”).
- **“Catalog Data”** section displays:
  - Item Photo.
  - Catalog Code.
  - Catalog Name.
  - Item Type.
  - Current / reference Price for the selected date.
  - Discount information (Discount Name & Discount Amount) if present.
  - Description.
  - Created Date / Last Update (if shown in the design).

- Top‑right buttons:
  - **Edit** – navigates to Edit Data (FR‑030.2).
  - **Delete** – opens delete confirmation (FR‑030.5).

### Data & Behaviour Requirements

- Backend returns catalog details for the given `catalogId` as long as the item belongs to the Admin PT’s PT.
- If the catalog item does not exist or is not under this PT, show an error message like “Catalog data not found” and a link back to Catalog Master.

### Acceptance Criteria

- Values on the detail page match the data in the list and the add/edit form.
- Unauthorized access to catalog items belonging to other PTs is blocked.

---

## FR‑030.4 Import Catalog Data

### Description
Admin PT can perform **bulk import** of catalog data using a file (e.g., Excel) that follows a provided template.

### UI & Interaction Requirements

- **“Import Data”** button in the Catalog Master header opens an import dialog or dedicated page.
- Main components:
  - Brief instructions on how to use the import feature.
  - **Download Template** link/button.
  - File upload field to select the import file (allowed formats such as `.xlsx` / `.csv`).
  - **Cancel** and **Upload / Import** buttons.

- After the Admin PT uploads a file and clicks **Import**:
  - The system shows a loading/progress indicator.
  - On full success:
    - Show success modal and refresh the catalog list.
  - On partial error (row‑level issues such as missing required fields, unknown item type, invalid numeric values):
    - Show an error summary and, optionally, provide a downloadable error log.

### Data & Behaviour Requirements

- For each row in the import file:
  - If the item **already exists** in the catalog (based on the defined key, e.g., Catalog Code or Name + Item Type):
    - The update process adjusts the **latest price** while keeping old prices as history.
  - If the item **does not exist**:
    - The import creates a new catalog record.
- The import is executed strictly in the context of the Admin PT’s PT and must not affect other PTs.

### Security & Business Rules

- Only Admin PT is allowed to import catalog data for their PT.
- Uploaded files must pass validation for format and maximum file size.
- All import operations must be logged with user, timestamp, and number of successful/failed rows.

### Acceptance Criteria

- Importing a valid file successfully adds/updates catalog data according to the historical rules.
- Import errors are clearly reported and do not leave the catalog in an inconsistent state.

---

## FR‑030.5 Delete Catalog Item

### Description
Admin PT can delete (soft delete) a single catalog item.

### UI & Interaction Requirements

- Entry points:
  - **Action → Delete** from the Catalog Master table, or
  - **Delete** button from the catalog detail page.
- Confirmation modal:
  - Title: **“Are You Sure?”**.
  - Message: explains that the catalog item will be deactivated and no longer usable for new transactions, but existing historical data remains.
  - Buttons: **Cancel** and **Yes**.

- After confirming **Yes**:
  - On success:
    - Show success modal like “Success! Data has been deleted.” and remove the item from the default active list (or show it as inactive according to table design).
  - On failure (e.g., system error):
    - Show an appropriate error message.

### Data & Behaviour Requirements

- Delete operation must not perform a physical delete:
  - Set `status = Inactive` or `deleted = true` (soft delete).
  - Keep the record for SPK history and audit purposes.

### Security & Business Rules

- Admin PT can only delete catalog items belonging to their own PT.
- Deleting a catalog item must not break historical calculations for past transactions.

### Acceptance Criteria

- After a successful delete, the item no longer appears in the active Catalog Master list under default filters.
- Past SPK transactions that used this catalog price still display the correct historical price.
