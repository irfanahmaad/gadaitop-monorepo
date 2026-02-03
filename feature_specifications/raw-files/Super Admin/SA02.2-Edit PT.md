FR‑039 Open Edit PT Form
Feature Name: Open Edit PT Form

Description: The system opens the Edit PT form with existing data when the user chooses to edit a PT.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

From the Master PT list, choosing “Edit” in a row action opens the Edit PT screen for that specific PT.

All PT fields (Logo, PT Code, PT Name, PT Email, PT Phone) and Admin Primary fields (Full Name, Email, Phone) are pre‑filled with current database values.

The breadcrumb and page title clearly indicate that the user is editing an existing PT, not creating a new one.

FR‑040 Edit PT Details
Feature Name: Edit PT Details

Description: The form allows modification of core PT data while keeping constraints such as uniqueness and valid formats.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

The user can update PT Name, PT Email, PT Phone, and PT Logo; PT Code may be editable or read‑only according to business rules (if read‑only, it appears disabled).

Changing PT Logo updates the displayed logo preview after the new image is selected.

PT Email and PT Phone validation rules are applied on edit, with inline error messages for invalid values.
​

FR‑041 Edit PT Primary Admin Information
Feature Name: Edit PT Primary Admin Details

Description: The Admin Primary section allows editing the main admin’s contact details associated with the PT.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

The user can modify the Admin Primary’s Full Name, Email, and Phone fields.

Changes in Admin Primary details are stored in the corresponding user account linked to the PT.

If any Admin Primary field fails validation (e.g., invalid email format), the system displays inline errors and prevents saving until corrected.
​

FR‑042 Edit PT Admin Primary Credentials
Feature Name: Edit PT Admin Primary Credentials

Description: The system allows updating the Primary Admin’s password from the Edit PT form, with confirmation.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

Password and Repeat Password fields follow the same rules as the Add PT form: minimum length, allowed characters, and matching confirmation.

If Password fields are left blank (as per business rule), the current password remains unchanged.

When a new password is provided and passes validation, the system updates the Primary Admin’s password securely.

FR‑043 Validate and Update PT
Feature Name: Save PT Changes

Description: The system validates edited PT and Admin Primary data and updates the existing records when the user saves the form.

Actor: Super Admin (Owner)

Priority: High

Acceptance Criteria:

Clicking “Save” validates all editable fields and displays inline error messages for any invalid or missing required values.

When validation passes and the user confirms in the confirmation dialog (FR‑044), the existing PT and Primary Admin records are updated in the database, not duplicated.
​

After successful update, refresing or returning to the Master PT list shows the modified values (e.g., PT Name, logo, Primary Admin name).

FR‑044 Confirmation Dialog Before Updating PT
Feature Name: Confirm Update PT

Description: Before applying changes, the system shows a confirmation dialog asking the user to confirm updating PT data.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

After clicking “Save” on a valid Edit PT form, a dialog appears asking the user to confirm saving PT changes.

Choosing “Cancel” closes the dialog and returns to the form with no changes saved.

Choosing “Yes/Confirm” applies the changes and triggers the success dialog (FR‑045).
​

FR‑045 Success Dialog After Updating PT
Feature Name: PT Updated Success Dialog

Description: After PT data is successfully updated, the system shows a success dialog to inform the user.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

Following a successful update, a success dialog appears with a success message such as “PT data updated successfully”.
​

The dialog includes a “Close” or “OK” button to dismiss it.

After closing the dialog, the user is redirected to the Master PT list or remains on the Edit PT screen according to the agreed navigation flow, and this behavior is consistent.

FR‑046 Cancel Edit PT
Feature Name: Cancel Edit PT

Description: The system allows the user to cancel editing PT and return to the Master PT list without saving changes.

Actor: Super Admin (Owner)

Priority: Medium

Acceptance Criteria:

Clicking “Cancel” (Batal) on the Edit PT form navigates back to the Master PT list.

If there are unsaved changes, the system either warns the user or clearly discards them, based on the final UX decision.

When the user cancels, no updates are applied to the PT or Admin Primary records.