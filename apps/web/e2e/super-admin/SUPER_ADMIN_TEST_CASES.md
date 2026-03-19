# Super Admin Role — Test Case Documentation

Test cases for the **Super Admin** role in **Project: Digitalisasi Gadai Top Indonesia**, aligned with the spreadsheet format (Feature, Scenario ID, Test Scenario, Case ID, Test Case, Type, Priority, Pre-Conditions, Process Steps, Test Data, Expected Result).

---

## 1. Login

| Field | Content |
|--------|--------|
| **Feature** | Login |
| **Scenario ID** | Authentication & Login |
| **Test Scenario** | As a Super Admin, I want to log in using email and password so that I can access the dashboard |

### Case 1.1 — Verify user can login with valid email and password

| Field | Content |
|--------|--------|
| Case ID | TC-LOGIN-001 |
| Test Case | Verify user can login with valid email and password |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User account is registered and active |
| Process Steps | 1. Open login page<br>2. Enter valid email<br>3. Enter valid password<br>4. Click Masuk |
| Test Data | Email: superadmin@mail.com (or admin@gadaitop.com)<br>Password: [valid password] |
| Expected Result | User is successfully logged in and redirected to the dashboard |

### Case 1.2 — Verify login fails with incorrect password

| Field | Content |
|--------|--------|
| Case ID | TC-LOGIN-002 |
| Test Case | Verify login fails with incorrect password |
| Type | Negative |
| Priority | High |
| Pre-Conditions | Email is registered |
| Process Steps | 1. Open login page<br>2. Enter valid email<br>3. Enter incorrect password<br>4. Click Masuk |
| Test Data | Email: superadmin@mail.com<br>Password: wrongpassword |
| Expected Result | Login fails and error message is displayed |

### Case 1.3 — Verify login fails with unregistered email

| Field | Content |
|--------|--------|
| Case ID | TC-LOGIN-003 |
| Test Case | Verify login fails with unregistered email |
| Type | Negative |
| Priority | High |
| Pre-Conditions | Email is not registered |
| Process Steps | 1. Open login page<br>2. Enter unregistered email<br>3. Enter any password<br>4. Click Masuk |
| Test Data | Email: unregistered@mail.com<br>Password: any |
| Expected Result | Login is rejected and error message is displayed |

### Case 1.4 — Verify validation when email and password are empty

| Field | Content |
|--------|--------|
| Case ID | TC-LOGIN-004 |
| Test Case | Verify validation when email and password are empty |
| Type | Negative |
| Priority | Medium |
| Pre-Conditions | User is on login page |
| Process Steps | 1. Leave email empty<br>2. Leave password empty<br>3. Click Masuk |
| Test Data | Empty |
| Expected Result | Required field validation message is displayed |

### Case 1.5 — Verify validation for invalid email format

| Field | Content |
|--------|--------|
| Case ID | TC-LOGIN-005 |
| Test Case | Verify validation for invalid email format |
| Type | Negative |
| Priority | Medium |
| Pre-Conditions | User is on login page |
| Process Steps | 1. Enter invalid email format<br>2. Enter password<br>3. Click Masuk |
| Test Data | Email: notanemail<br>Password: any |
| Expected Result | Email format validation error is displayed |

### Case 1.6 — Verify password visibility toggle works

| Field | Content |
|--------|--------|
| Case ID | TC-LOGIN-006 |
| Test Case | Verify password visibility toggle works |
| Type | Positive |
| Priority | Low |
| Pre-Conditions | Password field contains value |
| Process Steps | 1. Enter password<br>2. Click eye icon |
| Test Data | Password123 |
| Expected Result | Password is shown and can be hidden again |

---

## 2. Dashboard

| Field | Content |
|--------|--------|
| **Feature** | Dashboard |
| **Scenario ID** | Dashboard Overview |
| **Test Scenario** | As a Super Admin, I want to view the dashboard so that I can monitor business overview |

### Case 2.1 — Verify dashboard loads successfully after login

| Field | Content |
|--------|--------|
| Case ID | TC-DASH-001 |
| Test Case | Verify dashboard loads successfully after login |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Super Admin |
| Process Steps | 1. Login as Super Admin<br>2. Open Dashboard menu (or navigate to root) |
| Test Data | — |
| Expected Result | Dashboard page loads; summary metrics (e.g. SPK Aktif) and content are visible |

### Case 2.2 — Verify dashboard summary cards display correct data

| Field | Content |
|--------|--------|
| Case ID | TC-DASH-002 |
| Test Case | Verify dashboard summary cards display correct data |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Dashboard is opened; data exists |
| Process Steps | 1. Open Dashboard<br>2. Wait for data to load<br>3. Verify summary cards show expected values |
| Test Data | — |
| Expected Result | Summary cards display correct data (no skeleton after load) |

### Case 2.3 — Verify company filter works correctly

| Field | Content |
|--------|--------|
| Case ID | TC-DASH-003 |
| Test Case | Verify company filter works correctly |
| Type | Positive |
| Priority | Medium |
| Pre-Conditions | Multiple companies exist |
| Process Steps | 1. Open Dashboard<br>2. Select a company from filter<br>3. Verify dashboard data updates |
| Test Data | — |
| Expected Result | Dashboard data reflects selected company |

### Case 2.4 — Verify branch filter works correctly

| Field | Content |
|--------|--------|
| Case ID | TC-DASH-004 |
| Test Case | Verify branch filter works correctly |
| Type | Positive |
| Priority | Medium |
| Pre-Conditions | Multiple branches exist |
| Process Steps | 1. Open Dashboard<br>2. Select company then branch from filter<br>3. Verify dashboard data updates |
| Test Data | — |
| Expected Result | Dashboard data reflects selected branch |

### Case 2.5 — Verify date filter works correctly

| Field | Content |
|--------|--------|
| Case ID | TC-DASH-005 |
| Test Case | Verify date filter works correctly |
| Type | Positive |
| Priority | Medium |
| Pre-Conditions | Data exists for multiple dates |
| Process Steps | 1. Open Dashboard<br>2. Change date range filter<br>3. Verify data updates |
| Test Data | — |
| Expected Result | Dashboard data reflects selected date range |

### Case 2.6 — Verify dashboard access is restricted without login

| Field | Content |
|--------|--------|
| Case ID | TC-DASH-006 |
| Test Case | Verify dashboard access is restricted without login |
| Type | Negative |
| Priority | High |
| Pre-Conditions | User is not logged in |
| Process Steps | 1. Open dashboard URL directly (e.g. /) |
| Test Data | — |
| Expected Result | User is redirected to login page |

---

## 3. Master Super Admin

| Field | Content |
|--------|--------|
| **Feature** | Master Super Admin |
| **Scenario ID** | Super Admin List & Management |
| **Test Scenario** | As a Super Admin, I want to view and manage the list of Super Admins so that I can manage system access |

### Case 3.1 — Verify Master Super Admin page loads successfully

| Field | Content |
|--------|--------|
| Case ID | TC-SA-001 |
| Test Case | Verify Master Super Admin page loads successfully |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Super Admin |
| Process Steps | 1. Login as Super Admin<br>2. Click "Master Super Admin" in sidebar or go to /super-admin |
| Test Data | — |
| Expected Result | Master Super Admin page loads; heading "Super Admin" is visible |

### Case 3.2 — Verify Super Admin list table is displayed

| Field | Content |
|--------|--------|
| Case ID | TC-SA-002 |
| Test Case | Verify Super Admin list table is displayed |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is on Master Super Admin page |
| Process Steps | 1. Wait for data to load (skeletons disappear)<br>2. Verify table is present |
| Test Data | — |
| Expected Result | Table is displayed with rows or empty state |

### Case 3.3 — Verify table displays correct columns

| Field | Content |
|--------|--------|
| Case ID | TC-SA-003 |
| Test Case | Verify table displays correct columns |
| Type | Positive |
| Priority | Medium |
| Pre-Conditions | Table is loaded |
| Process Steps | 1. Check table header columns |
| Test Data | — |
| Expected Result | Columns: ID, Nama, Email, No. Telepon, Status, Dibuat, and action column |

### Case 3.4 — Verify Super Admin data is displayed correctly in table rows

| Field | Content |
|--------|--------|
| Case ID | TC-SA-004 |
| Test Case | Verify Super Admin data is displayed correctly in table rows |
| Type | Positive |
| Priority | High |
| Pre-Conditions | At least one Super Admin exists |
| Process Steps | 1. Load Master Super Admin page<br>2. Verify row data matches expected (name, email, phone, status, date) |
| Test Data | — |
| Expected Result | Row data is correct and readable |

### Case 3.5 — Verify pagination works correctly

| Field | Content |
|--------|--------|
| Case ID | TC-SA-005 |
| Test Case | Verify pagination works correctly |
| Type | Positive |
| Priority | Medium |
| Pre-Conditions | More than one page of Super Admins exists (or page size set to small value) |
| Process Steps | 1. Navigate to next page<br>2. Verify URL/page changes and rows update<br>3. Navigate back if applicable |
| Test Data | — |
| Expected Result | Pagination controls work; page changes reflect in table |

### Case 3.6 — Verify search filters Super Admin list

| Field | Content |
|--------|--------|
| Case ID | TC-SA-006 |
| Test Case | Verify search filters Super Admin list |
| Type | Positive |
| Priority | Medium |
| Pre-Conditions | Multiple Super Admins exist; user is on list page |
| Process Steps | 1. Enter search term in "Cari Super Admin..." (e.g. "admin")<br>2. Wait for debounce/request<br>3. Verify table shows filtered results |
| Test Data | Search: admin |
| Expected Result | Table shows only rows matching search |

### Case 3.7 — Verify Detail opens from row action

| Field | Content |
|--------|--------|
| Case ID | TC-SA-007 |
| Test Case | Verify Detail opens from row action |
| Type | Positive |
| Priority | High |
| Pre-Conditions | At least one Super Admin exists |
| Process Steps | 1. On list page, open row action menu (⋯)<br>2. Click "Detail"<br>3. Verify navigation to detail page |
| Test Data | — |
| Expected Result | Navigates to /super-admin/[slug]; Data Super Admin card and sections are visible |

### Case 3.8 — Verify Create form page opens and has required fields

| Field | Content |
|--------|--------|
| Case ID | TC-SA-008 |
| Test Case | Verify Create form page opens and has required fields |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is on Master Super Admin list |
| Process Steps | 1. Click "Tambah Data"<br>2. Verify URL is /super-admin/create<br>3. Verify form has: fullName, email, phoneNumber, password, confirmPassword |
| Test Data | — |
| Expected Result | Create page loads; all required fields are visible |

### Case 3.9 — Verify new Super Admin can be created with valid data

| Field | Content |
|--------|--------|
| Case ID | TC-SA-009 |
| Test Case | Verify new Super Admin can be created with valid data |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is on Create Super Admin form |
| Process Steps | 1. Fill all required fields with valid data<br>2. Click Simpan<br>3. Confirm in confirmation dialog (Ya)<br>4. Verify redirect to list and new row appears |
| Test Data | fullName: E2E Test Admin, email: e2e.new@mail.com, phoneNumber: 08123456789, password: Password123!, confirmPassword: Password123! |
| Expected Result | Success toast; redirect to /super-admin; new Super Admin appears in list |

### Case 3.10 — Verify create fails with duplicate email

| Field | Content |
|--------|--------|
| Case ID | TC-SA-010 |
| Test Case | Verify create fails with duplicate email |
| Type | Negative |
| Priority | High |
| Pre-Conditions | A Super Admin with email existing@mail.com already exists |
| Process Steps | 1. Open Create form<br>2. Fill form with same email (existing@mail.com)<br>3. Click Simpan and confirm |
| Test Data | email: existing@mail.com (already in system) |
| Expected Result | Error message displayed; record not created |

### Case 3.11 — Verify Edit form opens from row action and saves

| Field | Content |
|--------|--------|
| Case ID | TC-SA-011 |
| Test Case | Verify Edit form opens from row action and saves |
| Type | Positive |
| Priority | High |
| Pre-Conditions | At least one Super Admin exists |
| Process Steps | 1. Open row action → "Edit"<br>2. Verify URL /super-admin/[slug]/edit and form pre-filled<br>3. Change one field (e.g. fullName)<br>4. Click Simpan, confirm in dialog<br>5. Verify redirect to detail and data updated |
| Test Data | Modified fullName: Updated Name |
| Expected Result | Edit page loads; after save, redirect to detail; data reflects changes |

### Case 3.12 — Verify Delete opens confirmation and removes Super Admin

| Field | Content |
|--------|--------|
| Case ID | TC-SA-012 |
| Test Case | Verify Delete opens confirmation and removes Super Admin |
| Type | Positive |
| Priority | High |
| Pre-Conditions | At least one Super Admin exists (prefer test-only record) |
| Process Steps | 1. Open row action → "Hapus"<br>2. Verify confirmation dialog with destructive message<br>3. Click confirm (Ya)<br>4. Verify success toast and row removed from list |
| Test Data | — |
| Expected Result | Confirmation shown; after confirm, Super Admin is deleted and list updates |

---

## 4. Master PT

| Field | Content |
|--------|--------|
| **Feature** | Master PT |
| **Scenario ID** | PT List & Management |
| **Test Scenario** | As a Super Admin, I want to view and manage the list of PT (companies) so that I can manage organizations |

### Case 4.1 — Verify Master PT page loads successfully

| Field | Content |
|--------|--------|
| Case ID | TC-PT-001 |
| Test Case | Verify Master PT page loads successfully |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Super Admin |
| Process Steps | 1. Click "Master PT" in sidebar or go to /pt |
| Test Data | — |
| Expected Result | Page loads; heading "Master PT" visible |

### Case 4.2 — Verify PT list table is displayed with correct columns

| Field | Content |
|--------|--------|
| Case ID | TC-PT-002 |
| Test Case | Verify PT list table is displayed with correct columns |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is on Master PT page |
| Process Steps | 1. Wait for table to load<br>2. Verify columns: No, Foto, Kode PT, Nama PT, No. Telp PT, Admin Primary, actions |
| Test Data | — |
| Expected Result | Table and columns match specification |

### Case 4.3 — Verify search filters PT list

| Field | Content |
|--------|--------|
| Case ID | TC-PT-003 |
| Test Case | Verify search filters PT list |
| Type | Positive |
| Priority | Medium |
| Pre-Conditions | Multiple PT exist |
| Process Steps | 1. Enter search term (e.g. "PT")<br>2. Verify table updates with filtered results |
| Test Data | Search: PT |
| Expected Result | Table shows only matching PT |

### Case 4.4 — Verify Detail opens from row action

| Field | Content |
|--------|--------|
| Case ID | TC-PT-004 |
| Test Case | Verify Detail opens from row action |
| Type | Positive |
| Priority | High |
| Pre-Conditions | At least one PT exists |
| Process Steps | 1. Open row action → "Detail"<br>2. Verify navigation to /pt/[id] and data card visible |
| Test Data | — |
| Expected Result | Detail page loads with PT data |

### Case 4.5 — Verify Create PT form opens and has required fields

| Field | Content |
|--------|--------|
| Case ID | TC-PT-005 |
| Test Case | Verify Create PT form opens and has required fields |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is on Master PT list |
| Process Steps | 1. Click "Tambah Data"<br>2. Verify URL /pt/create<br>3. Verify form has: code, name, adminName, adminEmail, password, confirmPassword (and image upload) |
| Test Data | — |
| Expected Result | Create page loads; required fields visible |

---

## 5. Master Tipe Barang

| Field | Content |
|--------|--------|
| **Feature** | Master Tipe Barang |
| **Scenario ID** | Tipe Barang CRUD |
| **Test Scenario** | As a Super Admin, I want to manage Tipe Barang (item types) so that I can maintain product categories |

### Case 5.1 — Verify Master Tipe Barang page loads successfully

| Field | Content |
|--------|--------|
| Case ID | TC-TB-001 |
| Test Case | Verify Master Tipe Barang page loads successfully |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Super Admin |
| Process Steps | 1. Click "Master Tipe Barang" in sidebar or go to /tipe-barang |
| Test Data | — |
| Expected Result | Page loads; heading "Master Tipe Barang" visible |

### Case 5.2 — Verify table displays with correct columns

| Field | Content |
|--------|--------|
| Case ID | TC-TB-002 |
| Test Case | Verify table displays with correct columns |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is on Master Tipe Barang page |
| Process Steps | 1. Wait for table load<br>2. Verify columns: No, Kode Tipe Barang, Nama Tipe Barang, Created At, actions |
| Test Data | — |
| Expected Result | Table and columns match |

### Case 5.3 — Verify search with no results shows empty state

| Field | Content |
|--------|--------|
| Case ID | TC-TB-003 |
| Test Case | Verify search with no results shows empty state |
| Type | Positive |
| Priority | Low |
| Pre-Conditions | User is on list page |
| Process Steps | 1. Enter search term that matches no row (e.g. xyz_no_match_999)<br>2. Verify "No results" or empty state shown |
| Test Data | Search: xyz_no_match_999 |
| Expected Result | No results message or empty state displayed |

### Case 5.4 — Verify Create Tipe Barang (dialog) creates new item

| Field | Content |
|--------|--------|
| Case ID | TC-TB-004 |
| Test Case | Verify Create Tipe Barang (dialog) creates new item |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is on Master Tipe Barang list |
| Process Steps | 1. Click "Tambah Data"<br>2. Dialog "Tambah Tipe Barang" opens<br>3. Fill typeCode and typeName<br>4. Click Simpan<br>5. Verify dialog closes and new row appears in table |
| Test Data | typeCode: Z1234, typeName: E2E Test Item Z1234 |
| Expected Result | New Tipe Barang created and visible in table |

### Case 5.5 — Verify Edit Tipe Barang (dialog) updates item

| Field | Content |
|--------|--------|
| Case ID | TC-TB-005 |
| Test Case | Verify Edit Tipe Barang (dialog) updates item |
| Type | Positive |
| Priority | High |
| Pre-Conditions | At least one Tipe Barang exists (e.g. created in TC-TB-004) |
| Process Steps | 1. Open row action → "Edit"<br>2. Dialog "Edit Tipe Barang" opens; code disabled, name editable<br>3. Change typeName<br>4. Click Simpan<br>5. Verify dialog closes and table shows updated name |
| Test Data | typeName: E2E EDITED Z1234 |
| Expected Result | Item updated in table |

### Case 5.6 — Verify Delete Tipe Barang with confirmation

| Field | Content |
|--------|--------|
| Case ID | TC-TB-006 |
| Test Case | Verify Delete Tipe Barang with confirmation |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Test Tipe Barang exists (e.g. from TC-TB-004) |
| Process Steps | 1. Open row action → "Hapus"<br>2. Confirm in dialog (Ya)<br>3. Verify row removed from table |
| Test Data | — |
| Expected Result | Item deleted; table updates |

---

## 6. Sidebar Navigation

| Field | Content |
|--------|--------|
| **Feature** | Sidebar Navigation |
| **Scenario ID** | Super Admin Menu Access |
| **Test Scenario** | As a Super Admin, I want to access all allowed menu items from the sidebar so that I can navigate the system |

### Case 6.1 — Verify Master Super Admin menu navigates correctly

| Field | Content |
|--------|--------|
| Case ID | TC-NAV-001 |
| Test Case | Verify Master Super Admin menu navigates correctly |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Super Admin |
| Process Steps | 1. Click "Master Super Admin" in sidebar |
| Test Data | — |
| Expected Result | Navigates to /super-admin |

### Case 6.2 — Verify Master PT menu navigates correctly

| Field | Content |
|--------|--------|
| Case ID | TC-NAV-002 |
| Test Case | Verify Master PT menu navigates correctly |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Super Admin |
| Process Steps | 1. Click "Master PT" in sidebar |
| Test Data | — |
| Expected Result | Navigates to /pt |

### Case 6.3 — Verify Master Tipe Barang menu navigates correctly

| Field | Content |
|--------|--------|
| Case ID | TC-NAV-003 |
| Test Case | Verify Master Tipe Barang menu navigates correctly |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Super Admin |
| Process Steps | 1. Click "Master Tipe Barang" in sidebar |
| Test Data | — |
| Expected Result | Navigates to /tipe-barang |

---

*Document generated for Project: Digitalisasi Gadai Top Indonesia. Map Case IDs to spreadsheet for execution tracking.*
