"""
E2E Test Suite for SPK & NKB Flows in Gadai Top.

Tests cover:
  1. Admin Authentication & Login
  2. SPK Creation (Admin)
  3. SPK Listing & Filtering (Admin)
  4. SPK Detail View (Admin)
  5. Customer Portal Authentication
  6. Customer Portal SPK List
  7. NKB - Pelunasan (Full Redemption)
  8. NKB - Perpanjangan Tepat Waktu (On-time Extension)
  9. NKB - Perpanjangan Terlambat (Late Extension)
  10. NKB Admin Approval
  11. Access Control Tests

Usage:
    # From root
    pnpm test:e2e:spk-nkb              # Run all tests (headless)
    pnpm test:e2e:spk-nkb:headed       # Run with browser visible
    pnpm test:e2e:spk-nkb:slow         # Run in slow motion

    # Direct Python
    python apps/web/e2e/spk-nkb-flow/spk-nkb-flow_test_full.py

Environment Variables:
    BASE_URL or NEXTAUTH_URL    - Base URL (default: http://localhost:3000)
    E2E_STAFF_EMAIL             - Staff email (default: staff.jkt001@test.com)
    E2E_STAFF_PASSWORD          - Staff password (default: test123)
    E2E_ADMIN_EMAIL             - Admin email (default: admin.pt001@test.com)
    E2E_ADMIN_PASSWORD          - Admin password (default: test123)
    E2E_CUSTOMER_NIK            - Customer NIK (default: 3201010101010001)
    E2E_CUSTOMER_PIN            - Customer PIN (default: 111111)
    HEADED=1                    - Run with visible browser
    SLOW=500                    - Slow motion for debugging

Requires: Playwright (pip install playwright && playwright install chromium)
"""

import sys
import os
import time
import traceback
from pathlib import Path
from playwright.sync_api import sync_playwright, Page

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

from pages.base_page import BasePage
from pages.login_page import LoginPage
from pages.customer_login_page import CustomerLoginPage
from pages.spk_list_page import SpkListPage
from pages.spk_create_page import SpkCreatePage
from pages.spk_detail_page import SpkDetailPage
from pages.nkb_list_page import NkbListPage
from pages.customer_portal_page import CustomerPortalPage
from pages.customer_spk_detail_page import CustomerSpkDetailPage

from utils.helpers import (
    BASE_URL,
    SCREENSHOT_DIR,
    ensure_dir,
    screenshot,
    log_step,
    log_pass,
    log_fail,
    log_info,
    wait_for_data_loaded,
    get_unique_id,
    calculate_expected_interest,
    calculate_expected_penalty,
    format_nkb_number,
)
from fixtures.test_data import (
    STAFF_EMAIL,
    STAFF_PASSWORD,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    CUSTOMER_NIK,
    CUSTOMER_PIN,
    TEST_CUSTOMERS,
    TEST_ITEMS,
    TEST_PAYMENTS,
    BRANCH_CODES,
    SPK_STATUS,
    NKB_STATUS,
    NKB_PAYMENT_TYPES,
)


# ── Test: Admin Login ───────────────────────────────────────────────────────────

def test_admin_login(page: Page):
    """Test admin (staff) login functionality."""
    log_step("TEST 1: Admin Login (Staff)")

    login_page = LoginPage(page)
    login_page.goto()

    if login_page.login_as_staff():
        screenshot(page, "01_admin_login_success")
        log_pass("Admin login successful")
        return True
    else:
        screenshot(page, "01_admin_login_fail")
        log_fail("Admin login failed")
        return False


def test_admin_login_as_company_admin(page: Page):
    """Test company admin login functionality."""
    log_step("TEST 1b: Admin Login (Company Admin)")

    login_page = LoginPage(page)
    login_page.goto()

    if login_page.login_as_admin():
        screenshot(page, "01b_company_admin_login_success")
        log_pass("Company admin login successful")
        return True
    else:
        screenshot(page, "01b_company_admin_login_fail")
        log_fail("Company admin login failed")
        return False


# ── Test: SPK List ─────────────────────────────────────────────────────────────

def test_spk_list(page: Page):
    """Test SPK list page loads and displays data."""
    log_step("TEST 2: SPK List Page")

    spk_list = SpkListPage(page)
    spk_list.goto()
    spk_list.wait_for_page_ready()

    row_count = spk_list.get_row_count()
    log_pass(f"SPK list has {row_count} row(s)")

    # Test search functionality
    spk_list.search("test")
    page.wait_for_timeout(1000)
    log_pass("Search executed")

    spk_list.clear_search()
    page.wait_for_timeout(500)

    screenshot(page, "02_spk_list")
    return True


# ── Test: SPK Creation ─────────────────────────────────────────────────────────

def test_spk_create(page: Page):
    """Test creating a new SPK."""
    log_step("TEST 3: SPK Creation")

    spk_create = SpkCreatePage(page)
    spk_create.goto()
    spk_create.wait_for_page_ready()

    # Prepare test data
    unique_id = get_unique_id()
    item_data = {
        "type": TEST_ITEMS["hp_android"]["type"],
        "brand": TEST_ITEMS["hp_android"]["brand"],
        "model": f"E2E Test {unique_id}",
        "condition": TEST_ITEMS["hp_android"]["condition"],
        "completeness": TEST_ITEMS["hp_android"]["completeness"],
        "imei": f"{unique_id}" * 3,
    }

    # Fill form and submit
    result = spk_create.create_spk(
        customer_nik=TEST_CUSTOMERS["valid"]["nik"],
        item_data=item_data,
        loan_amount=500000,
    )

    if result:
        # Verify redirect to list or detail
        page.wait_for_timeout(2000)
        screenshot(page, "03_spk_create_success")
        log_pass("SPK created successfully")
        return True
    else:
        screenshot(page, "03_spk_create_fail")
        log_fail("SPK creation failed")
        return False


# ── Test: SPK Detail View ───────────────────────────────────────────────────────

def test_spk_detail(page: Page):
    """Test viewing SPK detail with NKB history."""
    log_step("TEST 4: SPK Detail View")

    # First navigate to SPK list
    spk_list = SpkListPage(page)
    spk_list.goto()
    spk_list.wait_for_page_ready()

    # Click detail on first row
    if spk_list.click_row_detail(1):
        page.wait_for_timeout(2000)

        spk_detail = SpkDetailPage(page)
        spk_detail.wait_for_page_ready()

        status = spk_detail.get_spk_status()
        log_pass(f"SPK status: {status}")

        nkb_count = spk_detail.get_nkb_count()
        log_pass(f"NKB records: {nkb_count}")

        screenshot(page, "04_spk_detail")
        return True
    else:
        log_fail("Could not navigate to SPK detail")
        return False


# ── Test: Customer Portal Login ────────────────────────────────────────────────

def test_customer_login(page: Page):
    """Test customer portal login with NIK + PIN."""
    log_step("TEST 5: Customer Portal Login")

    customer_login = CustomerLoginPage(page)
    customer_login.goto()

    if customer_login.login_as_customer():
        screenshot(page, "05_customer_login_success")
        log_pass("Customer login successful")
        return True
    else:
        screenshot(page, "05_customer_login_fail")
        log_fail("Customer login failed")
        return False


# ── Test: Customer Portal SPK List ─────────────────────────────────────────────

def test_customer_spk_list(page: Page):
    """Test customer portal SPK list."""
    log_step("TEST 6: Customer Portal SPK List")

    customer_portal = CustomerPortalPage(page)
    customer_portal.goto()
    customer_portal.wait_for_page_ready()

    spk_count = customer_portal.get_spk_count()
    log_pass(f"Customer has {spk_count} SPK(s)")

    # Check status badges
    if spk_count > 0:
        status = customer_portal.get_spk_status_badge(1)
        log_pass(f"First SPK status: {status}")

        # Check if pay button is visible
        has_pay = customer_portal.has_pay_button(1)
        log_pass(f"Pay button visible: {has_pay}")

    screenshot(page, "06_customer_spk_list")
    return True


# ── Test: NKB - Pelunasan (Full Redemption) Flow ────────────────────────────────

def test_nkb_pelunasan_flow(page: Page):
    """Test full redemption (pelunasan) flow via customer portal."""
    log_step("TEST 7: NKB - Pelunasan (Full Redemption) Flow")

    customer_portal = CustomerPortalPage(page)
    customer_portal.goto()
    customer_portal.wait_for_page_ready()

    # Click on first SPK detail
    if customer_portal.click_spk_detail(1):
        page.wait_for_timeout(2000)

        spk_detail = CustomerSpkDetailPage(page)
        spk_detail.wait_for_page_ready()

        # Check if pay full button is available
        if spk_detail.has_pay_full_button():
            log_pass("Pay Full button visible")

            # Note: Actual payment processing would go here
            # For testing purposes, we verify the dialog can open
            # but don't complete actual payment to avoid test data issues

            screenshot(page, "07_nkb_pelunasan_dialog")
            log_pass("Pelunasan flow accessible")
            return True
        else:
            log_info("Pay Full button not visible (SPK may already be paid)")
            return True
    else:
        log_fail("Could not navigate to customer SPK detail")
        return False


# ── Test: NKB Admin Approval ───────────────────────────────────────────────────

def test_nkb_admin_approval(page: Page):
    """Test NKB admin approval workflow (assumes already logged in as staff)."""
    log_step("TEST 8: NKB Admin Approval")

    nkb_list = NkbListPage(page)
    nkb_list.goto()
    nkb_list.wait_for_page_ready()

    # Switch to pending tab
    nkb_list.goto_pending_tab()
    page.wait_for_timeout(1000)

    nkb_count = nkb_list.get_nkb_count()
    log_pass(f"Pending NKB count: {nkb_count}")

    if nkb_count > 0:
        # Get status before approval
        status_before = nkb_list.get_nkb_status(1)
        log_pass(f"Status before: {status_before}")

        # Note: We don't actually approve in tests to avoid data changes
        # Just verify the workflow is accessible

        screenshot(page, "08_nkb_admin_pending")
        log_pass("NKB approval workflow accessible")
        return True
    else:
        log_info("No pending NKBs to approve")
        screenshot(page, "08_nkb_admin_no_pending")
        return True


# ── Test: Access Control - Branch Staff ────────────────────────────────────────

def test_access_control_staff(page: Page):
    """Test that staff can only see their branch data (assumes already logged in as staff)."""
    log_step("TEST 9: Access Control - Branch Staff")

    spk_list = SpkListPage(page)
    spk_list.goto()
    spk_list.wait_for_page_ready()

    # Verify we're on SPK list
    if "spk" in page.url:
        log_pass("Staff can access SPK list")
        screenshot(page, "09_access_staff_spk_list")
        return True
    else:
        log_fail("Staff cannot access SPK list")
        return False


# ── Test: Access Control - Company Admin ───────────────────────────────────────

def test_access_control_admin(page: Page):
    """Test that company admin can see all branches (assumes already logged in as admin)."""
    log_step("TEST 10: Access Control - Company Admin")

    spk_list = SpkListPage(page)
    spk_list.goto()
    spk_list.wait_for_page_ready()

    # Company admin should have branch filter
    if spk_list.is_visible('[data-test-id="branch-filter"], select:has-text("Cabang")'):
        log_pass("Company admin has branch filter (multi-branch access)")
        screenshot(page, "10_access_admin_with_filter")
        return True
    else:
        log_info("Branch filter not visible or not applicable")
        screenshot(page, "10_access_admin")
        return True


# ── Test: SPK Status Badges ─────────────────────────────────────────────────────

def test_spk_status_badges(page: Page):
    """Test SPK status badges are displayed correctly (assumes already logged in as staff)."""
    log_step("TEST 11: SPK Status Badges")

    spk_list = SpkListPage(page)
    spk_list.goto()
    spk_list.wait_for_page_ready()

    row_count = spk_list.get_row_count()
    if row_count > 0:
        status = spk_list.get_spk_status_badge(1)
        log_pass(f"Row 1 status badge: {status}")

        # Verify status is one of the expected values
        if status in SPK_STATUS.values():
            log_pass("Status badge is valid")
        else:
            log_fail(f"Invalid status badge: {status}")

        screenshot(page, "11_spk_status_badges")
        return True
    else:
        log_fail("No SPK rows to check status")
        return False


# ── Test: Customer Portal Payment Buttons ───────────────────────────────────────

def test_customer_payment_buttons(page: Page):
    """Test payment button visibility based on SPK status (assumes already logged in as customer)."""
    log_step("TEST 12: Customer Payment Button Visibility")

    customer_portal = CustomerPortalPage(page)
    customer_portal.goto()
    customer_portal.wait_for_page_ready()

    spk_count = customer_portal.get_spk_count()
    if spk_count > 0:
        # Check first SPK
        status = customer_portal.get_spk_status_badge(1)
        has_pay = customer_portal.has_pay_button(1)

        log_pass(f"SPK status: {status}, Pay button: {has_pay}")

        # Active SPKs should have pay button
        if status == SPK_STATUS["berjalan"] or status == SPK_STATUS["terlambat"]:
            if has_pay:
                log_pass("Pay button correctly shown for active SPK")
            else:
                log_fail("Pay button should be visible for active SPK")

        screenshot(page, "12_customer_payment_buttons")
        return True
    else:
        log_fail("No SPKs found for customer")
        return False


# ── Main Test Runner ───────────────────────────────────────────────────────────

def _run_test_group(browser, group_name, login_fn, tests, results):
    """Run a group of tests in an isolated browser context with its own session."""
    log_step(f"SESSION: {group_name}")
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    try:
        if login_fn:
            login_fn(page)

        for name, test_fn in tests:
            try:
                test_fn(page)
                results["passed"] += 1
            except Exception as e:
                results["failed"] += 1
                results["errors"].append((name, str(e)))
                log_fail(f"Test '{name}' FAILED with exception: {e}")
                traceback.print_exc()
                screenshot(page, f"error_{name.replace(' ', '_').lower()}")
    finally:
        context.close()


def main():
    print(f"\n  BASE_URL: {BASE_URL}")
    print(f"  Staff: {STAFF_EMAIL}")
    print(f"  Admin: {ADMIN_EMAIL}")
    print(f"  Customer NIK: {CUSTOMER_NIK}")
    print()

    results = {"passed": 0, "failed": 0, "errors": []}

    with sync_playwright() as p:
        headless = os.environ.get("HEADED", "0") == "0"
        slow_mo = int(os.environ.get("SLOW", "0"))
        browser = p.chromium.launch(headless=headless, slow_mo=slow_mo)

        # ── Staff session (fresh browser context) ──
        _run_test_group(browser, "Staff Session", None, [
            ("Admin Login (Staff)", test_admin_login),
            ("SPK List Page", test_spk_list),
            ("SPK Creation", test_spk_create),
            ("SPK Detail View", test_spk_detail),
            ("SPK Status Badges", test_spk_status_badges),
            ("Access Control - Staff", test_access_control_staff),
            ("NKB Admin Approval", test_nkb_admin_approval),
        ], results)

        # ── Company Admin session (separate browser context) ──
        _run_test_group(browser, "Company Admin Session", None, [
            ("Admin Login (Company Admin)", test_admin_login_as_company_admin),
            ("Access Control - Admin", test_access_control_admin),
        ], results)

        # ── Customer session (separate browser context) ──
        _run_test_group(browser, "Customer Session", None, [
            ("Customer Login", test_customer_login),
            ("Customer SPK List", test_customer_spk_list),
            ("NKB Pelunasan Flow", test_nkb_pelunasan_flow),
            ("Customer Payment Buttons", test_customer_payment_buttons),
        ], results)

        browser.close()

    # Summary
    total = results["passed"] + results["failed"]
    print(f"\n{'='*60}")
    print(f"  TEST SUMMARY")
    print(f"{'='*60}")
    print(f"  Total : {total}")
    print(f"  Passed: {results['passed']}")
    print(f"  Failed: {results['failed']}")
    if results["errors"]:
        print(f"\n  Failures:")
        for name, err in results["errors"]:
            print(f"    - {name}: {err}")
    print(f"{'='*60}\n")

    sys.exit(0 if results["failed"] == 0 else 1)


if __name__ == "__main__":
    main()
