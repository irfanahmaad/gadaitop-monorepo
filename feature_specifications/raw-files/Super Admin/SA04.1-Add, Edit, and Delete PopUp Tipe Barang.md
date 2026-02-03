FR‑057 Add Item Type
Feature Name: Add Item Type

Description: The system provides an “Add Item Type” form to create a new Item Type with required code and name.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

The Add Item Type form contains at least two required fields: Item Type Code and Item Type Name, matching the labels/placeholders in the design.

Clicking “Save” validates that both fields are filled and that Item Type Code is unique; invalid or duplicate values show inline error messages and prevent saving.
​

When validation passes and the user confirms in the confirmation dialog (FR‑058), a new Item Type record is created and appears in the list with “Created At” set correctly.

FR‑058 Confirmation Dialog Before Saving Item Type
Feature Name: Confirm Save Item Type

Description: Before creating a new Item Type, the system shows a confirmation dialog.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

After clicking “Save” on a valid Add Item Type form, a confirmation dialog appears asking if the user wants to save the new Item Type.

The dialog provides “Cancel” and “Yes/Save” options; choosing “Cancel” returns to the form without saving.

Choosing “Yes/Save” proceeds with saving and triggers the success dialog (FR‑059).
​

FR‑059 Success Dialog After Adding Item Type
Feature Name: Item Type Added Success Dialog

Description: After successfully creating an Item Type, the system shows a success dialog.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

On successful creation, a success dialog appears with a message such as “Item Type saved successfully”.
​

The dialog includes a “Close” button that dismisses it.

After closing, the user sees the Item Type list with the new record visible in the correct position.

FR‑060 Edit Item Type
Feature Name: Edit Item Type

Description: The system allows editing an existing Item Type using the same form layout, with pre‑filled data.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

Selecting “Edit” from a row’s action menu opens the Edit Item Type form with Item Type Code and Item Type Name pre‑filled for that record.

The user can change Item Type Name and, if allowed, Item Type Code; uniqueness and required-field validation apply as on the Add form.
​

When validation passes and the user confirms in the edit confirmation dialog (FR‑061), the existing Item Type record is updated (not duplicated) and the list reflects the changes.

FR‑061 Confirmation & Success Dialogs for Editing Item Type
Feature Name: Confirm & Success Edit Item Type

Description: Editing an Item Type uses a confirmation dialog before saving, and a success dialog after a successful update.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

After clicking “Save” on a valid Edit Item Type form, a confirmation dialog appears asking the user to confirm saving changes.

Choosing “Cancel” closes the dialog without saving; choosing “Yes/Save” updates the record and shows a success dialog with a message such as “Item Type updated successfully”.
​

Closing the success dialog returns the user to the Item Type list, where the edited values are visible.

FR‑062 Delete Item Type
Feature Name: Delete Item Type

Description: The system allows deleting an Item Type via the row action menu, with confirmation and success feedback.

Actor: Super Admin (Owner), Super Admin

Priority: High

Acceptance Criteria:

Choosing “Delete” from an Item Type row’s action menu opens a confirmation dialog asking if the user is sure they want to delete this Item Type.

The dialog provides “Delete” and “Cancel”; choosing “Cancel” closes the dialog without changes, choosing “Delete” removes the Item Type from the database and shows a success dialog.
​

After the success dialog is closed, the Item Type no longer appears in the list, and the total count/pagination are updated correctly.

FR‑063 Cancel Add/Edit Item Type
Feature Name: Cancel Add/Edit Item Type

Description: The system allows users to abort creation or editing of Item Types without saving changes.

Actor: Super Admin (Owner), Super Admin

Priority: Medium

Acceptance Criteria:

Clicking “Cancel” (Batal) on either Add or Edit Item Type form navigates back to the Item Type list.

If the form contains unsaved changes, the system follows the agreed UX (either silently discards or warns that changes will be lost) consistently.

When the user cancels, no new Item Type is created and no changes are applied to existing records.