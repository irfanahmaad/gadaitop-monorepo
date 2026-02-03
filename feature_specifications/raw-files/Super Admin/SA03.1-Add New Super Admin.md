FR‑007 Open Add Super Admin Form
Feature Name: Open Add Super Admin Form

Description: The system opens the “Add Super Admin” form when the user chooses to create a new Super Admin from the list screen.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

From the Super Admin list, clicking the “Add Data” button navigates to the “Add Super Admin” page with an empty form.

The breadcrumb and page title clearly indicate that the user is on the “Add Super Admin” (create) screen.

The form layout is fully visible and usable on desktop, tablet, and mobile without horizontal scrolling issues.
​

FR‑008 Enter Super Admin Details
Feature Name: Super Admin Detail Input

Description: The form allows the user to input basic details for the new Super Admin, including profile image, full name, email, and phone number.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

The form includes fields for: Profile Image (Upload), Full Name, Email, and Phone Number, matching the labels and placeholders from the design.

The Profile Image field allows image file selection and shows a preview or filename after upload.

All fields accept only valid formats (e.g., email must follow standard email pattern, phone number must be numeric within allowed length).

FR‑009 Define Super Admin Security Credentials
Feature Name: Super Admin Security Credentials

Description: The form allows the user to define a password for the new Super Admin, including a repeat password field to confirm it.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

The form includes “Password” and “Repeat Password” fields under a Security section.

Password fields support a minimum length (e.g., at least 8 characters) and show inline validation messages when the rule is not met.
​

The “Repeat Password” field must match the “Password” field; mismatch shows an error and prevents submission.

FR‑010 Validate and Save Super Admin
Feature Name: Save New Super Admin

Description: The system validates all required fields and saves the new Super Admin record when the user clicks “Save”.
​

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Save” runs validation on all required fields (Full Name, Email, Phone Number, Password, Repeat Password).

If validation fails, the system shows inline error messages per field and does not create a record.

If validation passes and the user confirms in the confirmation dialog (see FR‑011), the system creates a new Super Admin record in the database.

FR‑011 Confirmation Dialog Before Saving
Feature Name: Confirm Save New Super Admin

Description: Before saving, the system shows a confirmation dialog asking the user to confirm creating the new Super Admin.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

After clicking “Save” on a valid form, a confirmation dialog appears with a clear question (e.g., “Are you sure you want to save this new Super Admin?”) and two buttons (Cancel, Yes).

Clicking “Cancel” closes the dialog and returns to the form without saving any data.

Clicking “Yes” proceeds with saving the record and, on success, opens the success dialog (FR‑012).

FR‑012 Success Dialog After Saving
Feature Name: Super Admin Saved Success Dialog

Description: After successfully saving a new Super Admin, the system shows a success dialog to inform the user that the operation completed.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

After the record is successfully created, a success dialog appears with a success icon and a message such as “Data saved successfully”.
​

The success dialog includes a “Close” button that dismisses the dialog.

Closing the dialog returns the user either to the Super Admin list (with the new record visible) or keeps them on the form depending on the agreed flow, and this behavior is consistent.

FR‑013 Cancel Add Super Admin
Feature Name: Cancel Add Super Admin

Description: The system allows the user to cancel the creation of a new Super Admin using the “Cancel” (Batal) button.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

Clicking “Cancel” on the form navigates back to the Super Admin list screen.

If there are unsaved changes, the system either warns the user or clearly discards the changes, according to the defined UX rule.

After cancel, no new Super Admin record is created in the database.