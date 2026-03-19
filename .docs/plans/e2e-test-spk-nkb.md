# E2E Test Plan: SPK & NKB Flows

## Context

This plan creates comprehensive End-to-End tests for the **SPK (Surat Perintah Kerja)** and **NKB (Nota Kredit Barang)** workflows. These are the core business flows of the GadaiTop pawnshop system:

- **SPK**: Pawn agreement creation when customers pawn items
- **NKB**: Payment records for installments (cicilan), extensions (perpanjangan), and full redemption (pelunasan)

The tests will cover both the **Admin Dashboard** (staff workflows) and **Customer Portal** (customer self-service payments), following the user stories in `.docs/spk-and-nkb.md`.

## Why This Change

Currently, there are no E2E tests covering the critical SPK/NKB financial workflows. These flows involve:

- Complex calculations (interest, penalties based on timing)
- Multi-role interactions (customer, staff, admin)
- State transitions (draft → active → extended → redeemed)
- Financial data integrity

E2E tests will ensure these critical business processes work correctly end-to-end.

## Implementation Plan

### 1. Folder Structure

Create `apps/web/e2e/spk-nkb-flow/`:

```
spk-nkb-flow/
├── spk-nkb-flow_test_full.py          # Main test file
├── spk-nkb-flow_test_cases.md         # Detailed test cases
├── spk-nkb-flow_test_scenarios.md     # Test scenarios overview
├── spk-nkb-flow_test_cases_spreadsheet.tsv  # Matrix format
├── pages/                             # Page Object Models
│   ├── __init__.py
│   ├── base_page.py                   # Base page with common utilities
│   ├── login_page.py                  # Admin login
│   ├── customer_login_page.py         # Customer portal login
│   ├── spk_list_page.py               # SPK list page
│   ├── spk_detail_page.py             # SPK detail page
│   ├── spk_create_page.py             # SPK creation page
│   ├── nkb_list_page.py               # NKB list/admin page
│   ├── customer_portal_page.py        # Customer portal home
│   └── customer_spk_detail_page.py    # Customer SPK detail + payment
├── fixtures/                          # Test data fixtures
│   ├── __init__.py
│   └── test_data.py                   # Test customers, SPKs, NKBs
├── utils/                             # Helper utilities
│   ├── __init__.py
│   ├── helpers.py                     # SPK/NKB specific helpers
│   └── assertions.py                  # Custom assertions
└── screenshots/                       # Auto-generated screenshots
```

### 2. Test Accounts

From `apps/api/src/seeders/user/admin-users.seed.ts`:

| Role          | Email                 | Password           | Company | Branch |
| ------------- | --------------------- | ------------------ | ------- | ------ |
| Staff JKT001  | staff.jkt001@test.com | test123            | PT001   | JKT001 |
| Staff BDG001  | staff.bdg001@test.com | test123            | PT001   | BDG001 |
| Company Admin | admin.pt001@test.com  | test123            | PT001   | -      |
| Customer      | NIK from test data    | PIN from test data | -       | -      |

**Note**: Customer portal uses NIK + PIN authentication, not email/password.

### 3. Page Object Model Classes

Key POM classes to implement:

#### `base_page.py`

```python
class BasePage:
    # Common utilities: wait_for_data_loaded, screenshot, log_step
    # Reused from existing e2e patterns
```

#### `spk_create_page.py`

- `goto()`: Navigate to /spk/tambah
- `select_customer(nik)`: Search and select customer
- `fill_item_details(...)`: Item type, condition, IMEI, etc.
- `set_loan_amount(amount)`: Input loan amount
- `upload_ktp(image_path)`: Upload KTP image
- `submit()`: Submit and handle confirmation dialog
- `confirm_pin_entry(pin)`: Handle PIN confirmation flow

#### `customer_spk_detail_page.py`

- `goto(spk_id)`: Navigate to customer portal SPK detail
- `click_pay_installment()`: Click "Bayar Cicil"
- `click_pay_full()`: Click "Bayar Lunas"
- `select_payment_method(method)`: Cash or Transfer
- `enter_principal_amount(amount)`: For partial payments
- `get_payment_summary()`: Return calculated breakdown
- `submit_payment()`: Submit payment dialog

#### `nkb_list_page.py`

- `goto_pending()`: Navigate to "NKB Baru" tab
- `goto_history()`: Navigate to "History NKB" tab
- `approve_nkb(nkb_number)`: Approve pending NKB
- `reject_nkb(nkb_number, reason)`: Reject with reason
- `get_nkb_count()`: Count NKBs in current tab
- `filter_by_date_range(start, end)`: Apply date filter

### 4. Test Scenarios

Based on `.docs/spk-and-nkb.md` user stories:

#### **Suite 1: SPK Creation (Admin)**

| Test ID | Description                                        | Priority |
| ------- | -------------------------------------------------- | -------- |
| SPK-01  | Create SPK with valid customer and item            | P0       |
| SPK-02  | Validate blacklist customer cannot create SPK      | P0       |
| SPK-03  | Validate loan amount does not exceed catalog price | P0       |
| SPK-04  | Generate QR Code (verify one-time print)           | P1       |
| SPK-05  | Verify SPK number format (internal & customer)     | P1       |

#### **Suite 2: SPK Listing & Detail (Admin)**

| Test ID | Description                                     | Priority |
| ------- | ----------------------------------------------- | -------- |
| SPK-06  | List SPK with branch filter                     | P0       |
| SPK-07  | List SPK with date range filter                 | P0       |
| SPK-08  | List SPK with amount range filter               | P1       |
| SPK-09  | Search SPK by customer name/NIK/SPK number      | P0       |
| SPK-10  | View SPK detail with NKB history                | P0       |
| SPK-11  | Verify status badges (Berjalan/Terlambat/Lunas) | P1       |

#### **Suite 3: Customer Portal - Login & List**

| Test ID | Description                                      | Priority |
| ------- | ------------------------------------------------ | -------- |
| CUST-01 | Login with NIK + PIN                             | P0       |
| CUST-02 | View active SPK list                             | P0       |
| CUST-03 | Verify payment button visibility based on status | P1       |
| CUST-04 | Filter SPK by amount range                       | P2       |

#### **Suite 4: NKB - Pelunasan (Full Redemption)**

| Test ID | Description                                             | Priority |
| ------- | ------------------------------------------------------- | -------- |
| NKB-01  | Customer initiates full redemption via portal           | P0       |
| NKB-02  | Verify calculation: <15 days (5% interest)              | P0       |
| NKB-03  | Verify calculation: >15 days (10% interest)             | P0       |
| NKB-04  | Staff confirms cash payment                             | P0       |
| NKB-05  | Verify SPK status changes to "Lunas"                    | P0       |
| NKB-06  | Verify NKB number format: [LOC]-NKB-[YYYYMMDD]-[4digit] | P1       |

#### **Suite 5: NKB - Perpanjangan Tepat Waktu (On-time Extension)**

| Test ID | Description                                            | Priority |
| ------- | ------------------------------------------------------ | -------- |
| NKB-07  | Customer initiates on-time extension (<15 days)        | P0       |
| NKB-08  | Verify calculation: (Pokok x 10%) + admin + insurance  | P0       |
| NKB-09  | Enter partial principal payment (min Rp50.000)         | P0       |
| NKB-10  | Validate minimum principal Rp50.000                    | P0       |
| NKB-11  | Verify due date extension: old + 30 days               | P0       |
| NKB-12  | Verify SPK status remains "Berjalan"                   | P0       |
| NKB-13  | Verify next cycle interest based on PREVIOUS principal | P1       |

#### **Suite 6: NKB - Perpanjangan Terlambat (Late Extension)**

| Test ID | Description                                        | Priority |
| ------- | -------------------------------------------------- | -------- |
| NKB-14  | Customer initiates late extension (>due date)      | P0       |
| NKB-15  | Verify penalty: 2% per month late                  | P0       |
| NKB-16  | Verify penalty for multiple months late            | P0       |
| NKB-17  | Verify due date: old + 30 days (not from pay date) | P0       |
| NKB-18  | Verify SPK status returns to "Berjalan"            | P0       |

#### **Suite 7: NKB Admin Approval**

| Test ID | Description                          | Priority |
| ------- | ------------------------------------ | -------- |
| NKB-19  | View pending NKB in "NKB Baru" tab   | P0       |
| NKB-20  | Approve pending NKB (cash payment)   | P0       |
| NKB-21  | Reject pending NKB with reason       | P1       |
| NKB-22  | Verify approved NKB moves to history | P0       |
| NKB-23  | Bulk delete NKB records              | P2       |

#### **Suite 8: Staff Scan QR Payment**

| Test ID  | Description                            | Priority |
| -------- | -------------------------------------- | -------- |
| STAFF-01 | Scan SPK QR Code shows correct details | P0       |
| STAFF-02 | Process pelunasan via scan             | P0       |
| STAFF-03 | Process perpanjangan via scan          | P0       |
| STAFF-04 | Verify automatic calculation display   | P0       |

#### **Suite 9: Cross-Branch Access Control**

| Test ID | Description                          | Priority |
| ------- | ------------------------------------ | -------- |
| AUTH-01 | Staff can only see their branch SPKs | P0       |
| AUTH-02 | Company admin can see all branches   | P0       |
| AUTH-03 | Customer only sees their own SPKs    | P0       |

### 5. Test Data Requirements

Fixtures needed in `fixtures/test_data.py`:

```python
TEST_CUSTOMERS = {
    "valid": {"nik": "1234567890123456", "name": "Test Customer", "pin": "123456"},
    "blacklist": {"nik": "9999999999999999", "name": "Blacklist Customer", "pin": "123456"},
    "existing": {"nik": "3201010101010001", "name": "Existing Customer", "pin": "111111"},
}

TEST_ITEMS = {
    "hp_android": {"type": "HP", "brand": "Samsung", "model": "A54", "imei": "123456789012345"},
    "laptop": {"type": "Laptop", "brand": "ASUS", "model": "Vivobook", "serial": "ABC12345"},
}

TEST_PAYMENTS = {
    "principal_min": 50000,
    "principal_partial": 100000,
    "principal_full": 1000000,  # Will be calculated dynamically
}
```

### 6. Scope (P0 + P1 Tests)

**This implementation covers P0 (Critical) and P1 (Important) test scenarios:**

- ✅ SPK-01 through SPK-11 (All SPK tests)
- ✅ CUST-01 through CUST-03 (Customer core flows)
- ✅ NKB-01 through NKB-18 (All NKB payment flows)
- ✅ NKB-19 through NKB-22 (Admin approval - exclude bulk delete P2)
- ✅ STAFF-01 through STAFF-04 (All staff scan tests)
- ✅ AUTH-01 through AUTH-03 (All access control tests)
- ⏭️ CUST-04 (P2 - amount filter)
- ⏭️ NKB-23 (P2 - bulk delete)

### 7. Implementation Order

**Phase 1: Foundation (Setup)**

1. Create folder structure
2. Implement `base_page.py` with common utilities
3. Implement `login_page.py` and `customer_login_page.py`
4. Create test data fixtures
5. **Add API helper for date mocking** - endpoints to manipulate SPK created_at dates

**Phase 2: Admin SPK Flows** 6. Implement `spk_create_page.py` POM 7. Implement `spk_list_page.py` POM 8. Write SPK-01 through SPK-11 tests

**Phase 3: Customer Portal Flows** 9. Implement `customer_portal_page.py` and `customer_spk_detail_page.py` POM 10. Write CUST-01 through CUST-03 tests

**Phase 4: NKB Payment Flows** 11. Implement payment dialog interactions 12. Write NKB-01 through NKB-06 (Pelunasan tests) 13. Write NKB-07 through NKB-13 (Perpanjangan tepat waktu tests) 14. Write NKB-14 through NKB-18 (Perpanjangan terlambat tests)

**Phase 5: Admin NKB Approval** 15. Implement `nkb_list_page.py` POM 16. Write NKB-19 through NKB-22 tests

**Phase 6: Staff Scan Flows** 17. Implement QR scan simulation 18. Write STAFF-01 through STAFF-04 tests

**Phase 7: Access Control** 19. Write AUTH-01 through AUTH-03 tests

**Phase 8: Cleanup & Finalization** 20. Add auto-cleanup utilities (delete test SPKs/NKBs after each test) 21. Generate test documentation (test cases, scenarios)

### 7. Key Utilities to Implement

In `utils/helpers.py`:

```python
async def calculate_expected_payment(spk, payment_type, days_elapsed):
    """Calculate expected payment for assertions"""
    # Implements business logic from user story

async def create_test_spk_api(spk_data):
    """Create SPK via API for test setup"""

async def get_spk_status(spk_id):
    """Get current SPK status for verification"""

async def wait_for_nkb_created(page, timeout=10000):
    """Wait for NKB to appear in list"""

def format_nkb_number(location, date):
    """Generate expected NKB number format"""
```

### 8. Critical Files to Reference

- Existing test pattern: `apps/web/e2e/master-pengguna/` or `apps/web/e2e/master-toko/`
- SPK pages: `apps/web/app/(dashboard)/spk/`
- NKB pages: `apps/web/app/(dashboard)/nkb/`
- Customer portal: `apps/web/app/(customer-portal)/portal-customer/`
- API types: `apps/web/lib/api/types.ts`
- Test accounts: `apps/api/src/seeders/user/admin-users.seed.ts`

### 9. Verification

After implementation:

1. **Run tests locally**:

   ```bash
   cd apps/web
   pnpm test:e2e:spk-nkb
   ```

2. **Check coverage**:
   - All P0 tests passing
   - Screenshots captured for key steps
   - Test report generated

3. **CI/CD Integration**:
   - Add to existing E2E test workflow
   - Run on PRs and before releases

4. **Manual Verification**:
   - Run in headed mode to visually verify flows
   - Test with real payment gateway (mocked)

### 10. Notes

- **Timing-dependent tests**: Use **API endpoint to mock server dates** for SPK created_at timestamps - allows testing <15 days vs >15 days interest scenarios reliably
- **Test isolation**: Each test creates its own data with unique identifiers (timestamp-based)
- **Auto cleanup**: Tests automatically delete created SPKs/NKBs after completion (even on failure for debugging)
- **Parallel execution**: Tests use unique data prefixes to enable safe parallel execution
- **Slow motion**: Use `SLOW=500` env var for debugging visual flows
- **Screenshots**: Capture at key steps (login, form submit, payment, confirmation)
- **Retry logic**: Use existing retry patterns for network-dependent tests
- **Priority scope**: P0 + P1 tests implemented (P2 tests deferred to future iteration)
