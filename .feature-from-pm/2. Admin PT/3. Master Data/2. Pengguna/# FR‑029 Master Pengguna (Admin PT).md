# FR‑029 Master Pengguna (Admin PT)

## Feature Name
Master Pengguna – User Management for Admin PT

## Description
The system provides a **“Master Pengguna”** page where **Admin PT** manages all CMS users under their PT.  
From this page, Admin PT can:

- View, search, and filter the list of users.  
- Create new users with specific roles (Admin PT, Staff Toko, Stock Opname, Lelang, Marketing).  
- View user details.  
- Edit user information and role.  
- Delete users (single and bulk).

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. The user is logged in as Admin PT and has permission to access **Master Data → Master Pengguna**.  
2. The Admin PT is associated with exactly one PT in the system.  
3. User data for this PT may or may not exist (empty state supported).

---

## Postconditions

1. The list of users for the PT is up to date according to Admin PT actions.  
2. Created users can log in (according to their role and status), and deleted users are disabled/soft deleted.  

---

## FR‑029.1 View User List

### Description
Defines how Admin PT views and filters the user list on **Master Pengguna**.

### UI & Interaction Requirements

#### Header & Toolbar

- Page header:
  - Title: **“Master Pengguna”**.  
  - Subtitle/breadcrumb: `Pages / Master Pengguna`.  
- Top-right header button: **“+ Tambah Data”** to open the Add User form (FR‑029.2).  

Immediately above the table:

- Rows‑per‑page dropdown (e.g., 10 / 25 / 50 / 100).  
- Search field (placeholder along the lines of “Cari nama, email, atau nomor telepon”).  
- **Filter** button – toggles the filter panel shown below the table.

#### Table "Daftar Pengguna"

Header label: **“Daftar Pengguna”**.

Columns as seen:

1. Checkbox (row selection for bulk delete).  
2. User Photo (avatar).  
3. **Nama Pengguna**.  
4. **Email**.  
5. **No. Telepon**.  
6. **Role** (Admin PT, Staff Toko, Stock Opname, Lelang, Marketing).  
7. **Status** (Active / Inactive/Locked – colour coded as in Figma).  
8. **Action** (three‑dot menu).

Row behaviour:

- Clicking a cell does not navigate; all actions via Action menu.  
- Action menu contains at least:
  - **Detail** – open user detail page (FR‑029.3).  
  - **Edit** – open edit user page (FR‑029.4).  
  - **Delete** – trigger delete confirmation (FR‑029.5).

#### Filter Panel (Bottom Section)

- Appears when Filter is active.  
- Contains at least:

  - Dropdown **Role** with options:
    - Admin PT  
    - Staff Toko  
    - Stock Opname  
    - Lelang  
    - Marketing  

- Buttons:
  - **Reset** – clear applied filters and reload list.  
  - **Terapkan** – apply selected filters to the table.

#### Pagination & States

- Bottom-left: “Showing X–Y of Z results”.  
- Bottom-right: Previous / page number buttons / Next.  
- **Loading**: table skeleton/spinner while fetching.  
- **Empty**: message like “Belum ada pengguna” when list is empty for current search/filter.  
- **Error**: inline error message with Retry control.

### Data & Behaviour Requirements

- List scope:
  - Only users whose PT equals the current Admin PT’s PT.  
- Search:
  - Keyword is matched at least against Name, Email, and Phone number.  
- Filters:
  - Role filter restricts list to the selected role(s).  
- Pagination:
  - `page` and `pageSize` parameters control which slice of users is retrieved.  
- Checkbox selection:
  - Used for bulk delete; selecting the header checkbox selects all users on the current page.

### Security & Business Rules

- Admin PT cannot view or manage users from other PTs.  
- Status values:
  - **Active** users can log in if their role allows.  
  - **Inactive/Locked** users cannot log in but remain in database (no hard delete).  

### Acceptance Criteria

- Table columns and colours match Figma.  
- Search and filter correctly narrow the list without showing other PT’s users.  
- Bulk selection works and is used only for delete.

---

## FR‑029.2 Create User (Tambah Data Pengguna)

### Description
Admin PT can create a new user account belonging to their PT.

### UI & Interaction Requirements

#### Navigation & Header

- Clicking **“+ Tambah Data”** opens the **Tambah Data** page.  
- Breadcrumb: `Master Pengguna / Tambah Data`.  
- Section title: **“Data Pengguna”**.

#### Form Layout (from Figma)

Inputs:

- **Foto Pengguna** – avatar upload/control.  
- **Nama Pengguna** * – text.  
- **Email** * – text (unique login).  
- **No. Telepon** * – text.  
- **Role** * – dropdown with values:
  - Admin PT  
  - Staff Toko  
  - Stock Opname  
  - Lelang  
  - Marketing  

- **Username / ID** (if shown in your Figma – keep label as in design).  
- **Kata Sandi** * – password field (masked, with eye toggle).  
- **Ulangi Kata Sandi** * – confirm password field.

Buttons:

- **Batal** – cancel and go back to Master Pengguna list (confirmation if fields changed).  
- **Simpan** – validate and submit.

#### Validation

- All fields marked * required.  
- Email must be valid format and not already used by another user.  
- Password must fulfil minimal security rules (length, complexity as defined globally).  
- Password confirmation must match.  
- Role must be one of allowed roles.

#### Feedback

- On successful save:
  - Show success modal “Sukses! Data berhasil disimpan.”  
  - Return to list; new user visible in Daftar Pengguna.  
- On validation errors:
  - Show inline messages under each invalid field.

### Data & Behaviour Requirements

- On submit, payload includes:
  - `ptId = current Admin PT’s PT ID`.  
  - Name, email, phone, role, password, avatar.  
- Backend encrypts/hashes password and stores user.  

### Security & Business Rules

- Admin PT may not be allowed to create another Admin PT depending on your policy; if so, the **Admin PT** role can be hidden from Role dropdown for this actor.  
- New user always belongs to Admin PT’s PT; PT cannot be changed on this screen.

### Acceptance Criteria

- Form fields and role options match the screenshot & sticky notes.  
- Creating a valid user adds them to the list.  
- Invalid submissions do not create users and display clear error messages.

---

## FR‑029.3 View User Detail

### Description
Shows detailed information about a user in read‑only form.

### UI & Interaction Requirements

- Accessed by clicking **Detail** from the Action menu in the list.  
- Page header displays the user’s name (e.g., “Agung Prasetyo Setyadi”).  
- Section title: **“Data Pengguna”**.  
- Card shows:
  - Avatar.  
  - Nama Pengguna.  
  - Email.  
  - No. Telepon.  
  - Role.  
  - Status (if desired).  

- Top-right buttons:
  - **Edit** – open Edit Data (FR‑029.4).  
  - **Hapus** – delete this user (FR‑029.5).

### Data & Behaviour Requirements

- Backend returns full user data for `userId` as long as the user belongs to Admin PT’s PT.  
- If the user does not exist or is not in this PT, show error “Data pengguna tidak ditemukan” and link back to Master Pengguna.

### Acceptance Criteria

- Detail page values match those in the list and add form.  
- Unauthorized access to foreign users is blocked.

---

## FR‑029.4 Edit User (Edit Data Pengguna)

### Description
Allows Admin PT to edit existing user data.

### UI & Interaction Requirements

- Access:
  - From user list Action menu → **Edit**.  
  - From Detail page → **Edit** button.  
- Page title: **“Edit Data”**.  
- Section title: **“Data Pengguna”** (or “Data Super Admin” for that particular user type; use Figma text).

Form fields:

- Same set as in **Tambah Data**:
  - Foto Pengguna, Nama Pengguna, Email, No. Telepon, Role, (Username), Kata Sandi, Ulangi Kata Sandi.  
- Pre‑filled values for all but password fields.  
- Password fields:
  - Implementation option 1: hidden until “Ubah Kata Sandi” toggle is clicked.  
  - Implementation option 2: empty fields that only update password when filled.

Buttons:

- **Batal** – if any changes made, show confirm dialog before discarding.  
- **Simpan** – validate and update.

### Data & Behaviour Requirements

- On save:
  - Email uniqueness is validated (allow same email if unchanged, disallow if conflict).  
  - If password fields are left empty and no “change password” flagged, keep existing password.  
  - If password changed, validate and store new hash.

### Security & Business Rules

- Admin PT cannot move user to another PT; PT relationship is fixed.  
- Some users (e.g., main Admin PT account) may have restricted role change or delete; backend enforces this.

### Acceptance Criteria

- Editing valid data updates the user and shows success modal.  
- Editing invalid data shows field-level errors and does not save.  

---

## FR‑029.5 Delete User (Single & Bulk)

### Description
Admin PT can delete user accounts (soft delete) either individually or in bulk.

### UI & Interaction Requirements

#### Single Delete

- Triggered from:
  - Action menu → **Delete**, or  
  - Detail page → **Hapus** button.  
- Confirmation modal:
  - Title: **“Apakah Anda Yakin?”**.  
  - Message: explains that the user account will be removed/disabled.  
  - Buttons: **Batal** and **Ya** (confirm delete).

- On confirm:
  - On success: success modal “Sukses! Data berhasil dihapus.” and user removed from list.  
  - On failure: show error (for example if user cannot be deleted due to being only Admin PT).

#### Bulk Delete

- Admin PT checks multiple rows in the list.  
- A bulk action bar appears (or a bulk delete button becomes active) offering **Hapus**.  
- Clicking bulk **Hapus** opens a similar confirmation, describing how many users will be deleted.  
- On success:
  - All allowed users are removed from the table and success message shown.  
- On partial failure:
  - Inform which users could not be deleted and why.

### Data & Behaviour Requirements

- Delete operation sets user `status = Inactive` or `deleted = true` (soft delete).  
- User records remain in DB for audit/history.  
- Deleted users cannot login anymore.

### Security & Business Rules

- Admin PT can only delete users from their PT.  
- Some system-critical accounts may be non-deletable; backend must verify and return errors.  
- All deletions must be logged with admin user ID and timestamp.

### Acceptance Criteria

- Single and bulk delete flows match Figma modals.  
- After deletion, list and pagination summary update correctly.  

---

## FR‑029.6 Filter by Role (Filter Panel)

### Description
Defines specific behaviour of the filter panel for **Role**.

### UI & Interaction Requirements

- When Admin PT clicks the top **Filter** button:
  - A filter card opens (as in screenshot) containing:
    - Dropdown **Role** with role values.  
    - **Reset** and **Terapkan** buttons.

### Data & Behaviour Requirements

- **Terapkan**:
  - Calls user list API with `role=<selected role>`.  
  - Resets pagination to page 1.  
- **Reset**:
  - Clears role filter and reloads full list.

### Acceptance Criteria

- Setting Role filter and clicking Terapkan shows only users of that role.  
- Reset restores unfiltered list.

