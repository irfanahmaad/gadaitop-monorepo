FR‑047 View PT Detail
Feature Name: View PT Detail

Description: The system displays a dedicated detail page for a selected PT, showing PT information and its Primary Admin data.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

From the Master PT list, selecting “Detail” (or equivalent) opens the PT detail page for that record.

The page shows at least: PT Logo, PT Code, PT Name, PT Email, PT Phone, PT Type (if applicable), and an Admin Primary section with Full Name, Email, and Phone.

The PT Name appears as the main page title and the breadcrumb indicates the user is on the PT Detail screen.

FR‑048 Edit PT from Detail Page
Feature Name: Edit PT from Detail

Description: The PT detail page provides an Edit button that opens the Edit PT form for the same PT.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Edit” on the PT detail page navigates to the Edit PT form (FR‑039) for that PT.

Data shown in the detail view matches the pre‑filled values in the Edit PT form after navigation.

After saving or cancelling in the Edit form, the user returns to either the detail page or the PT list according to the defined navigation flow, consistently.

FR‑049 Delete PT from Detail Page
Feature Name: Delete PT from Detail

Description: The PT detail page provides a Delete button that allows removing the PT, with confirmation and feedback.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Delete” on the PT detail page opens a confirmation dialog asking the user to confirm deletion of that PT.
​

The confirmation dialog offers “Delete” and “Cancel” options; choosing “Cancel” closes the dialog without changes.

Choosing “Delete” removes the PT record (and any linked entities defined in business rules) and triggers the success dialog (FR‑050).

FR‑050 Success Dialog After Deleting PT
Feature Name: PT Deleted Success Dialog

Description: After a PT is successfully deleted, the system shows a success dialog informing the user that the data has been deleted.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

After deletion, a success dialog appears with a message such as “PT data deleted successfully”.
​

The dialog includes a “Close” or “OK” button to dismiss it.

After closing the dialog, the user is redirected to the Master PT list, where the deleted PT no longer appears and pagination/total count are updated.

FR‑051 Responsive Layout for PT Detail
Feature Name: Responsive PT Detail Layout

Description: The PT detail layout adapts to different screen sizes, keeping PT and Admin Primary information readable and actions accessible.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

On desktop, PT and Admin Primary sections follow the card layout shown in the design; on smaller screens, sections stack vertically without overlap.
​

Edit and Delete buttons remain visible and easily tappable on tablet and mobile.

No horizontal scrolling is required to see core PT and Admin Primary information on typical mobile resolutions.