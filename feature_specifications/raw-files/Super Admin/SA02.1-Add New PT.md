FR‑031 Open Add PT Form
Feature Name: Open Add PT Form

Description: The system opens the “Add PT” form when the user chooses to create a new PT from the Master PT list.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking the “Add Data” button on the Master PT page navigates to the Add PT screen with all fields empty.

The breadcrumb and page title clearly indicate the user is adding PT data, not editing existing PT.

The form container is fully visible and usable on desktop, tablet, and mobile without layout breaks.
​

FR‑032 Enter PT Details
Feature Name: PT Detail Input

Description: The form allows the user to input core PT information, including logo, PT code, PT name, PT email, and PT phone number.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

The form includes fields for: PT Logo (Upload Image), PT Code, PT Name, PT Email, and PT Phone, following the labels/placeholders from the design.

The PT Logo field accepts image files and displays a preview or file indication after selection.

PT Email and PT Phone fields validate format (valid email format and numeric phone with allowed length) and show inline error messages when invalid.
​

FR‑033 Enter Primary Admin Information for PT
Feature Name: PT Primary Admin Input

Description: The form includes an “Admin Primary” section to define the main admin account related to the PT.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

The Admin Primary section contains at least: Full Name, Email, and Phone fields for the primary admin user.

These fields are required (based on business rules) and show clear validation errors when left empty or incorrectly formatted.

The system links the created Admin Primary user to the PT record when the form is successfully submitted.

FR‑034 Define PT Admin Primary Credentials
Feature Name: PT Admin Primary Security Credentials

Description: The form allows setting a password for the Admin Primary, including repeat password confirmation.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

The Security section includes “Password” and “Repeat Password” fields, with minimum length and complexity rules as defined for the system.

“Repeat Password” must match “Password”; mismatches produce inline error messages and prevent submission.
​

Password fields support show/hide toggle (eye icon) as shown in the design, without exposing the password by default.

FR‑035 Validate and Save PT
Feature Name: Save New PT

Description: The system validates all mandatory fields and saves the new PT along with its Admin Primary account when the user clicks “Save”.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Save” runs validation for all required PT and Admin Primary fields and displays inline errors for any invalid or missing values.

If validation passes and the user confirms in the confirmation dialog (FR‑036), the system creates both the PT record and the linked Admin Primary user.

On success, the user sees the success dialog (FR‑037), and the new PT appears in the Master PT list with its logo, PT Code, PT Name, PT Email, PT Phone, and Primary Admin columns correctly filled.
​

FR‑036 Confirmation Dialog Before Saving PT
Feature Name: Confirm Save New PT

Description: Before saving, the system shows a confirmation dialog asking the user to confirm adding the new PT.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

After clicking “Save” on a valid Add PT form, a confirmation dialog appears summarizing that a new PT will be created.

Clicking “Cancel” closes the dialog and returns to the form without saving data.

Clicking “Yes/Confirm” proceeds with the save process and triggers the success dialog on success.
​

FR‑037 Success Dialog After Saving PT
Feature Name: PT Saved Success Dialog

Description: After successfully saving PT data, the system shows a success dialog to inform the user that the operation completed.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

After the PT is successfully created, a success dialog appears with a success icon and message such as “PT data saved successfully”.
​

The dialog has a “Close” or “OK” button that dismisses it.

After closing the dialog, the user is redirected to the Master PT list, where the new PT record is visible in the table.

FR‑038 Cancel Add PT
Feature Name: Cancel Add PT

Description: The system allows the user to cancel adding PT and return to the Master PT list without saving any changes.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

Clicking “Cancel” (Batal) on the Add PT form navigates back to the Master PT list page.

If there are unsaved inputs, the system either clearly discards them or optionally prompts the user that changes will be lost, according to the final UX rule.

No PT or Admin Primary record is created when the user cancels.