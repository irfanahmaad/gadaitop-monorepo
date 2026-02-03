FR‑026 View PT List
Feature Name: View PT List

Description: The system displays a table listing all PT (companies) with key information such as logo, PT code, PT name, PT email, PT phone number, and primary admin.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

The PT list page shows a table with columns: No, Logo, PT Code, PT Name, PT Email, PT Phone, Primary Admin, and Actions, matching the design.

Each row represents one PT record from the database; if a logo is missing, a default logo is shown.

The layout is readable and aligned correctly on desktop, tablet, and mobile without columns being cut off.
​

FR‑027 PT Pagination
Feature Name: PT List Pagination

Description: The system provides pagination controls for the PT list when the number of PTs exceeds the per‑page limit.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

Users can navigate between pages using “Previous”, “Next”, and page numbers at the bottom of the table.

The label “Showing X–Y of Z results” always reflects the correct range and total number of PT records.

Changing page does not reset the current filter or search term (if any).

FR‑028 Search PT by Email (and/or other fields)
Feature Name: Search PT

Description: The system provides a search input to filter PT records, initially focused on the PT email field as shown in the design, and optionally extended to other fields.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

The search input allows the user to enter an email or keyword and, after pressing Enter or the search icon, the table shows only matching PT records.
​

When no PT matches the search, the table displays an appropriate empty state message.

The search behavior is consistent across pages, and user input is preserved when navigating between pages.

FR‑029 Open Add PT Form
Feature Name: Open Add PT Form

Description: The system opens the “Add PT” form when the user clicks the “Add Data” button from the PT list.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Add Data” on the PT list navigates to the Add PT screen with an empty form.

The breadcrumb and page title clearly indicate that the user is adding a new PT.

The form’s layout follows the responsive design rules so it remains usable on desktop, tablet, and mobile.
​

FR‑030 PT Row Actions (Detail, Edit, Delete)
Feature Name: PT Row Actions

Description: The PT table provides row‑level actions via a three‑dot menu or equivalent control to view details, edit, or delete a PT.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Each row has an Action menu with options such as “Detail”, “Edit”, and “Delete” (or equivalent labels) as indicated in the design.

Choosing “Detail” opens the PT detail page for that record; choosing “Edit” opens the Edit PT form with pre‑filled data; choosing “Delete” opens a delete confirmation dialog.

After a successful delete, the PT is removed from the list and the pagination/total results adjust correctly.
​