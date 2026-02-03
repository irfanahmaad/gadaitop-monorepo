FR‑170 View User Master List
Feature Name: View User Master List

Description: The system displays a list of all users associated with the Admin PT’s PT.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Master Pengguna” page shows a table with columns such as User Name, Email, Role, Phone Number, Status (Active/Inactive/Pending), and Actions, matching the design.

The list supports pagination and basic search by name or email; Admin PT only sees users under their PT or permitted scope.
​

A Filter panel allows filtering by Role and Status; applying filters updates the list accordingly.

FR‑171 Create New User
Feature Name: Create User

Description: Admin PT can create new system users and assign them an initial role.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Tambah Data” form includes fields such as Full Name, Email (used as login), Role, Store/Branch, Phone Number, and optional avatar/photo.

Required fields are validated; email must be unique and properly formatted, and role selection is mandatory.
​

Upon successful save, the user is created with an initial status (e.g., Active or Pending) and a confirmation/success dialog is shown.

FR‑172 Edit User Details and Role
Feature Name: Edit User Data & Role

Description: Admin PT can update user profile information and adjust role assignments when responsibilities change.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

From the user detail or list, an Edit action opens a form pre-filled with current user data (name, email, role, branch, phone, status).

Admin PT can change role (e.g., Admin PT, Store Staff, Marketing) using the role dropdown, following the system’s RBAC model.
​

Saving changes requires confirmation and then updates the user record; success messages are displayed, and changes are logged for audit.

FR‑173 Activate / Deactivate User Accounts
Feature Name: Activate/Deactivate User

Description: Admin PT can disable a user’s access without deleting their record, and re-enable it when needed.

Actor: Admin PT

Priority: High

Acceptance Criteria:

An action (e.g., “Change Status”) allows toggling a user between Active and Inactive states, with a confirmation dialog.

Inactive users cannot log in to the system, but their records remain visible in the master list and linked to historical transactions.
​

Status changes are timestamped and attributed to the Admin PT performing the action.

FR‑174 View User Detail
Feature Name: View User Detail

Description: The system provides a dedicated detail screen for each user, summarizing their profile and current access.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

The detail page shows the user’s avatar, name, email, role, associated PT/store, phone number, and current status, matching the design layout.

From this screen, Admin PT can trigger actions such as Edit, Change Status, or other admin-specific operations.

The detail view is read-only until Edit is selected, helping prevent accidental changes.

FR‑175 Access Control for User Management
Feature Name: User Management Access Control

Description: Only highly privileged roles may manage user master data to protect security and integrity.

Actor: Admin PT / Super Admin Owner

Priority: High

Acceptance Criteria:

Only designated admin roles (e.g., Super Admin Owner, certain Admin PT) can access the Master Pengguna menu and perform create/edit/status-change operations; other roles are denied or given view-only access as configured.
​

All user creation, update, and activation/deactivation events are written to an audit log that records who performed the action and when.

Role options presented in the UI are limited to those the current admin is allowed to assign, preventing privilege escalation.