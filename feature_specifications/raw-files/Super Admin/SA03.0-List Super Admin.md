FR‑001 Feature Name: Login

Description: The system provides a login page to access the Gadai Top CMS using email/username and password.
​

Actor: Super Admin, Admin

Priority: High

Acceptance Criteria:

Users who enter valid credentials are redirected to the CMS dashboard.

Users who enter invalid credentials see a clear error message without a full page reload.
​

The login session remains active for a configurable period of inactivity before automatic logout.

FR‑002 View Master Super Admin List
FR‑002 Feature Name: View Super Admin List

Description: The system displays a scrollable table of Super Admins with columns for No, Photo, Full Name, Email, Phone Number, and Actions.
​

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

The table shows Super Admin records from the database ordered according to the agreed default (e.g., by No or Full Name).

Each row shows a default avatar image when no profile photo is available.

The table layout is readable and no columns are visually cut off on desktop, tablet, and mobile (responsive behavior).
​

FR‑003 Pagination for Super Admins
FR‑003 Feature Name: Super Admin Pagination

Description: The system provides pagination controls to navigate the Super Admin list when the number of records exceeds the per‑page limit.
​

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

Users can choose the number of rows per page (e.g., 10, 25, 50) from a dropdown above the table.

Clicking “Next”, “Previous”, or a page number loads the corresponding data without errors.

The “Showing X–Y of Z results” label always reflects the actual data range and total count.

FR‑004 Search Super Admin
FR‑004 Feature Name: Search Super Admin

Description: The system provides a search input to filter the Super Admin list by name, email, or phone number.
​

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

After entering a keyword and pressing Enter or the search icon, the list only shows records that match the criteria.

When no records match, the system displays an informative empty state instead of an error.

The search input and results remain usable and visually consistent on desktop, tablet, and mobile.

FR‑005 Create Super Admin
FR‑005 Feature Name: Add Super Admin

Description: The “Add Data” button opens a form to create a new Super Admin account and save it to the system.
​

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Add Data” opens a page or modal with fields such as Full Name, Email, Phone Number, Role, and Password.

Required fields are validated; invalid input shows inline error messages and the form is not submitted until corrected.
​

On successful submission, a success notification appears and the new Super Admin appears in the list.

FR‑006 Update/Delete Super Admin (Row Actions)
FR‑006 Feature Name: Manage Super Admin Actions

Description: The three‑dot menu in each row provides actions such as Edit and Delete for the selected Super Admin.
​

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking the three‑dot menu opens a dropdown with at least “Edit” and “Delete” options.

Choosing “Edit” opens a form with the existing data pre‑filled and saves changes when the input is valid.

Choosing “Delete” shows a confirmation dialog; when confirmed, the record is removed and no longer appears in the list.