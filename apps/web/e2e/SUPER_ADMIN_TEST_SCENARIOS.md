# Super Admin Role — Test Scenarios Summary

Summary of test scenarios and case IDs for **Super Admin** role. Use this for traceability and linking to the main test case document or spreadsheet.

**Project:** Digitalisasi Gadai Top Indonesia  
**Spreadsheet format:** Feature | Scenario ID | Test Scenario | Case ID | Test Case | Type | Priority | Pre-Conditions | Process Steps | Test Data | Expected Result

---

## Scenario Overview

| Feature | Scenario ID | Test Scenario | Case IDs |
|---------|-------------|---------------|---------|
| Login | Authentication & Login | As a Super Admin, I want to log in using email and password so that I can access the dashboard | TC-LOGIN-001 to TC-LOGIN-006 |
| Dashboard | Dashboard Overview | As a Super Admin, I want to view the dashboard so that I can monitor business overview | TC-DASH-001 to TC-DASH-006 |
| Master Super Admin | Super Admin List & Management | As a Super Admin, I want to view and manage the list of Super Admins so that I can manage system access | TC-SA-001 to TC-SA-012 |
| Master PT | PT List & Management | As a Super Admin, I want to view and manage the list of PT (companies) so that I can manage organizations | TC-PT-001 to TC-PT-005 |
| Master Tipe Barang | Tipe Barang CRUD | As a Super Admin, I want to manage Tipe Barang (item types) so that I can maintain product categories | TC-TB-001 to TC-TB-006 |
| Sidebar Navigation | Super Admin Menu Access | As a Super Admin, I want to access all allowed menu items from the sidebar so that I can navigate the system | TC-NAV-001 to TC-NAV-003 |

---

## By Feature

### Login (6 cases)

- **TC-LOGIN-001** — Verify user can login with valid email and password (Positive, High)
- **TC-LOGIN-002** — Verify login fails with incorrect password (Negative, High)
- **TC-LOGIN-003** — Verify login fails with unregistered email (Negative, High)
- **TC-LOGIN-004** — Verify validation when email and password are empty (Negative, Medium)
- **TC-LOGIN-005** — Verify validation for invalid email format (Negative, Medium)
- **TC-LOGIN-006** — Verify password visibility toggle works (Positive, Low)

### Dashboard (6 cases)

- **TC-DASH-001** — Verify dashboard loads successfully after login (Positive, High)
- **TC-DASH-002** — Verify dashboard summary cards display correct data (Positive, High)
- **TC-DASH-003** — Verify company filter works correctly (Positive, Medium)
- **TC-DASH-004** — Verify branch filter works correctly (Positive, Medium)
- **TC-DASH-005** — Verify date filter works correctly (Positive, Medium)
- **TC-DASH-006** — Verify dashboard access is restricted without login (Negative, High)

### Master Super Admin (12 cases)

- **TC-SA-001** — Verify Master Super Admin page loads successfully (Positive, High)
- **TC-SA-002** — Verify Super Admin list table is displayed (Positive, High)
- **TC-SA-003** — Verify table displays correct columns (Positive, Medium)
- **TC-SA-004** — Verify Super Admin data is displayed correctly in table rows (Positive, High)
- **TC-SA-005** — Verify pagination works correctly (Positive, Medium)
- **TC-SA-006** — Verify search filters Super Admin list (Positive, Medium)
- **TC-SA-007** — Verify Detail opens from row action (Positive, High)
- **TC-SA-008** — Verify Create form page opens and has required fields (Positive, High)
- **TC-SA-009** — Verify new Super Admin can be created with valid data (Positive, High)
- **TC-SA-010** — Verify create fails with duplicate email (Negative, High)
- **TC-SA-011** — Verify Edit form opens from row action and saves (Positive, High)
- **TC-SA-012** — Verify Delete opens confirmation and removes Super Admin (Positive, High)

### Master PT (5 cases)

- **TC-PT-001** — Verify Master PT page loads successfully (Positive, High)
- **TC-PT-002** — Verify PT list table is displayed with correct columns (Positive, High)
- **TC-PT-003** — Verify search filters PT list (Positive, Medium)
- **TC-PT-004** — Verify Detail opens from row action (Positive, High)
- **TC-PT-005** — Verify Create PT form opens and has required fields (Positive, High)

### Master Tipe Barang (6 cases)

- **TC-TB-001** — Verify Master Tipe Barang page loads successfully (Positive, High)
- **TC-TB-002** — Verify table displays with correct columns (Positive, High)
- **TC-TB-003** — Verify search with no results shows empty state (Positive, Low)
- **TC-TB-004** — Verify Create Tipe Barang (dialog) creates new item (Positive, High)
- **TC-TB-005** — Verify Edit Tipe Barang (dialog) updates item (Positive, High)
- **TC-TB-006** — Verify Delete Tipe Barang with confirmation (Positive, High)

### Sidebar Navigation (3 cases)

- **TC-NAV-001** — Verify Master Super Admin menu navigates correctly (Positive, High)
- **TC-NAV-002** — Verify Master PT menu navigates correctly (Positive, High)
- **TC-NAV-003** — Verify Master Tipe Barang menu navigates correctly (Positive, High)

---

## Total Count

| Feature | Number of Cases |
|---------|-----------------|
| Login | 6 |
| Dashboard | 6 |
| Master Super Admin | 12 |
| Master PT | 5 |
| Master Tipe Barang | 6 |
| Sidebar Navigation | 3 |
| **Total** | **38** |

---

*For full steps, test data, and expected results, see `SUPER_ADMIN_TEST_CASES.md`. For spreadsheet paste, use `SUPER_ADMIN_TEST_CASES_SPREADSHEET.tsv`.*
