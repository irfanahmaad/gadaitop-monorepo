FR‑014 Open Edit Super Admin Form
Feature Name: Open Edit Super Admin Form

Description: The system opens the “Edit Super Admin” form with existing data when the user chooses to edit a Super Admin from the list.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

From the Super Admin list, selecting “Edit” in the row action menu navigates to the Edit screen for that specific Super Admin.

All fields in the form (Profile Image, Full Name, Email, Phone Number, Password fields as designed) are pre‑filled with the current data from the database.
​

The breadcrumb and page title clearly indicate that the user is editing an existing Super Admin, not creating a new one.

FR‑015 Modify Super Admin Details
Feature Name: Edit Super Admin Details

Description: The form allows the user to modify the Super Admin’s details (except restricted fields if any) and keep or replace the existing profile image.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

The user can change Full Name, Email, Phone Number, and upload/replace the profile image.

If the profile image is replaced, the preview updates to show the newly selected image.

If some fields are configured as read‑only (e.g., username), they appear disabled and cannot be changed.

FR‑016 Modify Super Admin Security Credentials
Feature Name: Edit Super Admin Security Credentials

Description: The system allows updating the Super Admin’s password using the same Security section, with appropriate validation and confirmation.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

The password fields follow the same rules as the create form: minimum length, allowed characters, and matching “Password” and “Repeat Password” fields.
​

If the password is left blank (according to agreed behavior), the system keeps the current password unchanged.

If a new password is entered, the system validates it and updates the stored password only when validation passes.

FR‑017 Validate and Update Super Admin
Feature Name: Save Super Admin Changes

Description: The system validates edited data and updates the existing Super Admin record when the user saves the form.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Save” runs validation on all edited fields and shows inline error messages for any invalid values, preventing update until resolved.
​

Once validation passes and the user confirms via the confirmation dialog (FR‑018), the existing Super Admin record in the database is updated with the new values.

After a successful update, the Super Admin list shows the updated data (e.g., new name, email, or avatar) without creating a duplicate record.

FR‑018 Confirmation Dialog Before Updating
Feature Name: Confirm Update Super Admin

Description: Before applying changes, the system shows a confirmation dialog asking the user to confirm updating the Super Admin.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

After clicking “Save” on a valid edit form, a confirmation dialog appears summarizing that changes will be saved for the selected Super Admin.

Clicking “Cancel” closes the dialog and returns to the Edit form without applying changes.

Clicking “Yes/Confirm” applies the changes and triggers the success dialog (FR‑019).

FR‑019 Success Dialog After Updating
Feature Name: Super Admin Updated Success Dialog

Description: After successfully updating a Super Admin, the system shows a success dialog to inform the user that the changes were saved.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

After a successful update, a success dialog appears with a message such as “Super Admin updated successfully”.
​

The dialog includes a “Close” or “OK” button that dismisses the dialog.

After closing the dialog, the user is returned to the Super Admin list or remains on the Edit screen according to the defined UX flow, and this behavior is consistent.

FR‑020 Cancel Edit Super Admin
Feature Name: Cancel Edit Super Admin

Description: The system allows the user to cancel editing and return to the Super Admin list without saving changes.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

Clicking “Cancel” on the Edit form navigates back to the Super Admin list.

If there are unsaved changes, the system warns the user that changes will be lost or asks for confirmation, based on agreed UX.

When the user confirms cancellation, no changes are stored in the database for that Super Admin.