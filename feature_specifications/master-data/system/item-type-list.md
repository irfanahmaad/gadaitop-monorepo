FR‑052 View Item Type List
Feature Name: View Item Type List

Description: The system displays a table listing all Item Types with basic attributes such as code, name, and created date.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

The page shows a table with columns: No, Item Type Code, Item Type Name, Created At, and Action, matching the design.

Each row represents one Item Type record from the database, ordered by Created At or Item Type Code according to the agreed default.

The table layout remains readable on desktop, tablet, and mobile, without columns being visually cut off.

FR‑053 Item Type Pagination
Feature Name: Item Type List Pagination

Description: The system provides pagination for the Item Type list when the number of records exceeds the per‑page limit.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

Users can change the “rows per page” value (e.g., 10, 25, 100) from the dropdown above the table.

“Previous”, “Next”, and page number controls at the bottom allow navigation between pages, and the table updates accordingly.
​

The footer text “Showing X–Y of Z results” always reflects the correct range and total Item Type count.

FR‑054 Search Item Type
Feature Name: Search Item Type

Description: The system provides a search field to filter Item Type records by keyword (e.g., code or name).

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

The search input accepts a keyword; when the user presses Enter or clicks the search icon, the table shows only Item Types that match the keyword in configured fields (e.g., Code or Name).
​

If no Item Types match, an empty state message is displayed instead of an error.

Pagination works together with search, keeping the filter active when navigating between pages.

FR‑055 Open Add Item Type Form
Feature Name: Open Add Item Type Form

Description: The system opens an “Add Item Type” form when the user clicks the “Add Data” button.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Add Data” on the Master Tipe Barang page navigates to the Add Item Type screen with an empty form.

Breadcrumb and page title clearly indicate that the user is adding a new Item Type.

The form container is responsive and fully usable on common desktop, tablet, and mobile resolutions.
​

FR‑056 Item Type Row Actions (Edit, Delete)
Feature Name: Item Type Row Actions

Description: Each Item Type row provides an action menu (three dots) to edit or delete the selected Item Type.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Each row has an Action menu with at least “Edit” and “Delete” options, consistent with the design pattern used in other modules.

Selecting “Edit” opens the Edit Item Type form with data for that specific record pre‑filled; selecting “Delete” opens a confirmation dialog before deletion.

After a successful delete, the Item Type is removed from the list and the total count/pagination are updated correctly.
​