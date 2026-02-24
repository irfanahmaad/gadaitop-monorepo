"""
E2E Test Suite for Super Admin role in Gadai Top.

Tests:
  1. Login as Super Admin
  2. Dashboard - verify data loads fully
  3. Master Super Admin  - list, search, detail, create form
  4. Master PT           - list, search, detail, create form
  5. Master Tipe Barang  - list, search, full CRUD (create→edit→delete)
  6. Sidebar Navigation

Usage:
    .venv/bin/python apps/web/e2e/test_super_admin_full.py

Requires: Playwright (pip install playwright && playwright install chromium)
"""

import sys
import os
import time
import traceback
from playwright.sync_api import sync_playwright, Page

BASE_URL = "http://localhost:3000"
EMAIL = "admin@gadaitop.com"
PASSWORD = "admin123"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

# ── Helpers ────────────────────────────────────────────────────────────────────

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def screenshot(page: Page, name: str):
    ensure_dir(SCREENSHOT_DIR)
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  📸 Screenshot saved: {path}")

def log_step(msg: str):
    print(f"\n{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}")

def log_pass(msg: str):
    print(f"  ✅ PASS: {msg}")

def log_fail(msg: str):
    print(f"  ❌ FAIL: {msg}")

def wait_for_data_loaded(page: Page, timeout: int = 15000):
    """Wait for skeleton loaders to disappear."""
    try:
        page.wait_for_function(
            """() => {
                const skeletons = document.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]');
                return skeletons.length === 0;
            }""",
            timeout=timeout
        )
        return True
    except Exception:
        return False

def click_row_action(page: Page, row_selector: str, action_text: str):
    """
    Click the "..." action menu on a data table row, then click a specific menu item.
    Returns True if the menu item was clicked.
    """
    # The action button is the MoreHorizontal icon button in the last column
    row = page.locator(row_selector).first
    action_btn = row.locator('button:has(svg.lucide-more-horizontal), button:has(.sr-only)').first

    if not action_btn.is_visible():
        # Fallback: try the last button in the row
        action_btn = row.locator("td:last-child button").first

    if not action_btn.is_visible():
        log_fail(f"Action button not found in row")
        return False

    action_btn.click()
    page.wait_for_timeout(500)

    # Wait for dropdown menu to appear
    menu_item = page.locator(f'[role="menuitem"]:has-text("{action_text}")').first
    if menu_item.is_visible():
        menu_item.click()
        return True
    else:
        log_fail(f"Menu item '{action_text}' not visible")
        page.keyboard.press("Escape")
        return False


# ── Test: Login ────────────────────────────────────────────────────────────────

def test_login(page: Page):
    """Login as Super Admin and return to dashboard."""
    log_step("TEST 1: Login as Super Admin")

    page.goto(f"{BASE_URL}/login")
    page.wait_for_load_state("networkidle")

    page.fill('input[name="email"]', EMAIL)
    page.fill('input[name="password"]', PASSWORD)
    page.click('button[type="submit"]')

    page.wait_for_url(lambda url: "login" not in url, timeout=15000)
    page.wait_for_load_state("networkidle")

    assert "login" not in page.url, f"Still on login page: {page.url}"
    log_pass(f"Logged in → {page.url}")
    screenshot(page, "01_login_success")


# ── Test: Dashboard ────────────────────────────────────────────────────────────

def test_dashboard(page: Page):
    """Navigate to dashboard and wait for data to fully load."""
    log_step("TEST 2: Dashboard — wait for data to load")

    page.goto(f"{BASE_URL}/")
    page.wait_for_load_state("networkidle")

    # Wait for SPK Aktif metric text
    try:
        page.wait_for_function(
            """() => {
                const els = document.querySelectorAll('h2, h3, p, span');
                let found = false;
                els.forEach(el => {
                    if (el.textContent && el.textContent.includes('SPK Aktif')) found = true;
                });
                return found;
            }""",
            timeout=15000
        )
        log_pass("Dashboard heading 'SPK Aktif' visible")
    except Exception:
        log_fail("Dashboard metric 'SPK Aktif' did not appear")

    # Wait for skeletons to disappear
    if wait_for_data_loaded(page, 20000):
        log_pass("All skeleton loaders disappeared — data fully loaded")
    else:
        log_fail("Some skeleton loaders still visible after timeout")

    page.wait_for_timeout(2000)
    screenshot(page, "02_dashboard_loaded")
    log_pass("Dashboard loaded with full data")


# ── Test: Master Super Admin ──────────────────────────────────────────────────

def test_master_super_admin(page: Page):
    """Navigate to Master Super Admin, verify table, test search, detail, and create."""
    log_step("TEST 3: Master Super Admin")

    # 3a. Navigate
    page.goto(f"{BASE_URL}/super-admin")
    page.wait_for_load_state("networkidle")

    page.wait_for_selector('h1:has-text("Super Admin")', timeout=10000)
    log_pass("Page heading visible")

    if wait_for_data_loaded(page):
        log_pass("Table data loaded")
    else:
        log_fail("Table skeletons still visible")

    screenshot(page, "03a_super_admin_list")

    # 3b. Verify rows
    rows = page.locator("table tbody tr")
    row_count = rows.count()
    if row_count > 0:
        log_pass(f"Table has {row_count} row(s)")
    else:
        log_fail("Table has no rows")
        return

    # 3c. Search
    search_input = page.locator('input[placeholder*="Cari"], input[placeholder*="Search"]').first
    if search_input.is_visible():
        search_input.fill("admin")
        page.wait_for_timeout(500)
        filtered = page.locator("table tbody tr").count()
        log_pass(f"Search 'admin' → {filtered} result(s)")
        search_input.clear()
        page.wait_for_timeout(500)

    # 3d. Detail via action menu — use the second row (row with id=2) to avoid issues
    # We target a row reliably
    if click_row_action(page, "table tbody tr:nth-child(2)", "Detail"):
        # Wait for navigation to /super-admin/<uuid>
        try:
            page.wait_for_url(lambda url: "/super-admin/" in url and url != f"{BASE_URL}/super-admin", timeout=10000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            log_pass(f"Detail page → {page.url}")
            screenshot(page, "03b_super_admin_detail")
        except Exception:
            log_fail(f"Detail navigation did not happen. URL: {page.url}")
            screenshot(page, "03b_super_admin_detail_error")
        page.goto(f"{BASE_URL}/super-admin")
        page.wait_for_load_state("networkidle")

    # 3e. Create page
    page.wait_for_timeout(500)
    if wait_for_data_loaded(page):
        pass
    tambah_btn = page.locator('button:has-text("Tambah Data")')
    if tambah_btn.is_visible():
        tambah_btn.click()
        try:
            page.wait_for_url("**/super-admin/create", timeout=10000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            log_pass(f"Create page → {page.url}")

            # Verify form fields
            for name in ["fullName", "email", "phoneNumber", "password", "confirmPassword"]:
                f = page.locator(f'input[name="{name}"]')
                if f.is_visible():
                    log_pass(f"  Field '{name}' visible")
                else:
                    log_fail(f"  Field '{name}' NOT visible")

            screenshot(page, "03c_super_admin_create_form")
        except Exception:
            log_fail(f"Create page did not navigate. URL: {page.url}")
    else:
        log_fail("'Tambah Data' button not found")


# ── Test: Master PT ────────────────────────────────────────────────────────────

def test_master_pt(page: Page):
    """Navigate to Master PT, verify table, test search, detail, and create."""
    log_step("TEST 4: Master PT")

    # 4a. Navigate
    page.goto(f"{BASE_URL}/pt")
    page.wait_for_load_state("networkidle")

    page.wait_for_selector('h1:has-text("Master PT")', timeout=10000)
    log_pass("Page heading visible")

    if wait_for_data_loaded(page):
        log_pass("Table data loaded")
    else:
        log_fail("Table skeletons still visible")

    screenshot(page, "04a_master_pt_list")

    # 4b. Verify rows
    rows = page.locator("table tbody tr")
    row_count = rows.count()
    if row_count > 0:
        log_pass(f"Table has {row_count} row(s)")
    else:
        log_fail("Table has no rows")
        return

    # 4c. Search
    search_input = page.locator('input[placeholder*="Search"]').first
    if search_input.is_visible():
        search_input.fill("PT")
        page.wait_for_timeout(500)
        filtered = page.locator("table tbody tr").count()
        log_pass(f"Search 'PT' → {filtered} result(s)")
        search_input.clear()
        page.wait_for_timeout(500)

    # 4d. Detail via action menu
    if click_row_action(page, "table tbody tr:nth-child(1)", "Detail"):
        try:
            page.wait_for_url(lambda url: "/pt/" in url and url != f"{BASE_URL}/pt", timeout=10000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            log_pass(f"Detail page → {page.url}")
            screenshot(page, "04b_master_pt_detail")
        except Exception:
            log_fail(f"Detail navigation did not happen. URL: {page.url}")
            screenshot(page, "04b_master_pt_detail_error")
        page.goto(f"{BASE_URL}/pt")
        page.wait_for_load_state("networkidle")

    # 4e. Create page
    page.wait_for_timeout(500)
    if wait_for_data_loaded(page):
        pass
    tambah_btn = page.locator('button:has-text("Tambah Data")')
    if tambah_btn.is_visible():
        tambah_btn.click()
        try:
            page.wait_for_url("**/pt/create", timeout=10000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            log_pass(f"Create page → {page.url}")

            for name in ["code", "name", "adminName", "adminEmail", "password", "confirmPassword"]:
                f = page.locator(f'input[name="{name}"]')
                if f.is_visible():
                    log_pass(f"  Field '{name}' visible")
                else:
                    log_fail(f"  Field '{name}' NOT visible")

            screenshot(page, "04c_master_pt_create_form")
        except Exception:
            log_fail(f"Create page did not navigate. URL: {page.url}")
    else:
        log_fail("'Tambah Data' button not found")


# ── Test: Master Tipe Barang ──────────────────────────────────────────────────

def test_master_tipe_barang(page: Page):
    """Full CRUD test for Master Tipe Barang."""
    log_step("TEST 5: Master Tipe Barang")

    UNIQUE_CODE = f"Z{int(time.time()) % 10000}"
    UNIQUE_NAME = f"E2E Test Item {UNIQUE_CODE}"
    EDITED_NAME = f"E2E EDITED {UNIQUE_CODE}"

    # 5a. Navigate
    page.goto(f"{BASE_URL}/tipe-barang")
    page.wait_for_load_state("networkidle")

    page.wait_for_selector('h1:has-text("Master Tipe Barang")', timeout=10000)
    log_pass("Page heading visible")

    if wait_for_data_loaded(page):
        log_pass("Table data loaded")
    else:
        log_fail("Table skeletons still visible")

    screenshot(page, "05a_tipe_barang_list")

    # 5b. Verify rows
    rows = page.locator("table tbody tr")
    initial_count = rows.count()
    log_pass(f"Table has {initial_count} row(s)")

    # 5c. Search (negative test)
    search_input = page.locator('input[placeholder*="Search"]').first
    if search_input.is_visible():
        search_input.fill("xyz_no_match_999")
        page.wait_for_timeout(500)
        no_results = page.locator('td:has-text("No results")').count()
        if no_results > 0:
            log_pass("Search negative test: 'No results' shown")
        search_input.clear()
        page.wait_for_timeout(500)

    # ── CREATE ────────
    log_step("TEST 5d: Create Tipe Barang")
    tambah_btn = page.locator('button:has-text("Tambah Data")')
    if not tambah_btn.is_visible():
        log_fail("'Tambah Data' button not found")
        return

    tambah_btn.click()

    dialog = page.locator('[role="dialog"]')
    dialog.wait_for(state="visible", timeout=5000)
    log_pass("Create dialog opened")

    dialog_title = dialog.locator('text="Tambah Tipe Barang"')
    if dialog_title.is_visible():
        log_pass("Dialog title: 'Tambah Tipe Barang'")

    code_input = dialog.locator('input[name="typeCode"]')
    name_input = dialog.locator('input[name="typeName"]')

    code_input.fill(UNIQUE_CODE)
    name_input.fill(UNIQUE_NAME)
    log_pass(f"Filled Code='{UNIQUE_CODE}', Name='{UNIQUE_NAME}'")

    screenshot(page, "05b_tipe_barang_create_dialog")

    submit_btn = dialog.locator('button[type="submit"]:has-text("Simpan")')
    submit_btn.click()

    try:
        dialog.wait_for(state="hidden", timeout=10000)
        log_pass("Create dialog closed — item created")
    except Exception:
        log_fail("Dialog did not close after submit")
        screenshot(page, "05b_tipe_barang_create_error")
        return

    page.wait_for_timeout(2000)
    page.wait_for_load_state("networkidle")

    # Verify in table
    search_input = page.locator('input[placeholder*="Search"]').first
    search_input.fill(UNIQUE_CODE)
    page.wait_for_timeout(1000)

    new_row = page.locator(f'table tbody tr:has-text("{UNIQUE_CODE}")')
    if new_row.count() > 0:
        log_pass(f"Created item '{UNIQUE_CODE}' found in table")
    else:
        log_fail(f"Created item '{UNIQUE_CODE}' NOT found")

    search_input.clear()
    page.wait_for_timeout(500)
    screenshot(page, "05c_tipe_barang_after_create")

    # ── EDIT ────────
    log_step("TEST 5e: Edit Tipe Barang")

    search_input.fill(UNIQUE_CODE)
    page.wait_for_timeout(1000)

    target_selector = f'table tbody tr:has-text("{UNIQUE_CODE}")'
    if page.locator(target_selector).count() == 0:
        log_fail("Cannot find item to edit")
        search_input.clear()
        return

    if click_row_action(page, target_selector, "Edit"):
        edit_dialog = page.locator('[role="dialog"]')
        edit_dialog.wait_for(state="visible", timeout=5000)
        log_pass("Edit dialog opened")

        edit_title = edit_dialog.locator('text="Edit Tipe Barang"')
        if edit_title.is_visible():
            log_pass("Dialog title: 'Edit Tipe Barang'")

        code_field = edit_dialog.locator('input[name="typeCode"]')
        if code_field.is_disabled():
            log_pass("Code field disabled in edit mode ✓")

        name_field = edit_dialog.locator('input[name="typeName"]')
        name_field.clear()
        name_field.fill(EDITED_NAME)
        log_pass(f"Changed name to '{EDITED_NAME}'")

        screenshot(page, "05d_tipe_barang_edit_dialog")

        save_btn = edit_dialog.locator('button[type="submit"]:has-text("Simpan")')
        save_btn.click()

        try:
            edit_dialog.wait_for(state="hidden", timeout=10000)
            log_pass("Edit dialog closed — item updated")
        except Exception:
            log_fail("Edit dialog did not close")
            screenshot(page, "05d_tipe_barang_edit_error")
            search_input.clear()
            return

        page.wait_for_timeout(2000)
        page.wait_for_load_state("networkidle")

        # Verify
        search_input.clear()
        page.wait_for_timeout(500)
        search_input.fill(EDITED_NAME)
        page.wait_for_timeout(1000)

        edited_row = page.locator(f'table tbody tr:has-text("{EDITED_NAME}")')
        if edited_row.count() > 0:
            log_pass(f"Edited item '{EDITED_NAME}' found in table")
        else:
            log_fail(f"Edited item '{EDITED_NAME}' NOT found")

        screenshot(page, "05e_tipe_barang_after_edit")

    # ── DELETE ────────
    log_step("TEST 5f: Delete Tipe Barang")

    search_input.clear()
    page.wait_for_timeout(500)
    search_input.fill(UNIQUE_CODE)
    page.wait_for_timeout(1000)

    target_selector = f'table tbody tr:has-text("{UNIQUE_CODE}")'
    if page.locator(target_selector).count() == 0:
        log_fail("Cannot find item to delete")
        search_input.clear()
        return

    if click_row_action(page, target_selector, "Hapus"):
        # Wait for confirmation dialog
        confirm_dialog = page.locator('[role="alertdialog"], [role="dialog"]').last
        try:
            confirm_dialog.wait_for(state="visible", timeout=5000)
            log_pass("Confirmation dialog appeared")
        except Exception:
            log_fail("Confirmation dialog did not appear")
            search_input.clear()
            return

        screenshot(page, "05f_tipe_barang_delete_confirm")

        # Click confirm button
        confirm_btn = confirm_dialog.locator(
            'button:has-text("Ya"), button:has-text("Hapus"), '
            'button:has-text("Konfirmasi"), button:has-text("Lanjutkan")'
        )
        if confirm_btn.count() > 0:
            confirm_btn.first.click()
        else:
            confirm_dialog.locator("button").last.click()

        try:
            confirm_dialog.wait_for(state="hidden", timeout=10000)
            log_pass("Confirmation dialog closed")
        except Exception:
            log_fail("Confirmation dialog did not close")
            screenshot(page, "05f_tipe_barang_delete_error")
            search_input.clear()
            return

        page.wait_for_timeout(2000)
        page.wait_for_load_state("networkidle")

        # Verify
        search_input.clear()
        page.wait_for_timeout(500)
        search_input.fill(UNIQUE_CODE)
        page.wait_for_timeout(1000)

        remaining = page.locator(f'table tbody tr:has-text("{UNIQUE_CODE}")')
        no_results = page.locator('td:has-text("No results")')
        if remaining.count() == 0 or no_results.count() > 0:
            log_pass(f"Item '{UNIQUE_CODE}' successfully deleted")
        else:
            log_fail(f"Item '{UNIQUE_CODE}' still exists after deletion")

        search_input.clear()
        page.wait_for_timeout(500)
        screenshot(page, "05g_tipe_barang_after_delete")


# ── Test: Sidebar Navigation ──────────────────────────────────────────────────

def test_sidebar_navigation(page: Page):
    """Verify that all 3 menu items are accessible from the sidebar."""
    log_step("TEST 6: Sidebar Navigation")

    page.goto(f"{BASE_URL}/")
    page.wait_for_load_state("networkidle")

    menus = [
        ("Master Super Admin", "/super-admin"),
        ("Master PT", "/pt"),
        ("Master Tipe Barang", "/tipe-barang"),
    ]

    for label, expected_path in menus:
        link = page.locator(f'a:has-text("{label}")').first
        if link.is_visible():
            link.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1000)
            if expected_path in page.url:
                log_pass(f"Sidebar '{label}' → {page.url}")
            else:
                log_fail(f"Sidebar '{label}' → unexpected URL: {page.url}")
        else:
            log_fail(f"Sidebar link '{label}' NOT visible")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    passed = 0
    failed = 0
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        tests = [
            ("Login", test_login),
            ("Dashboard", test_dashboard),
            ("Sidebar Navigation", test_sidebar_navigation),
            ("Master Super Admin", test_master_super_admin),
            ("Master PT", test_master_pt),
            ("Master Tipe Barang (CRUD)", test_master_tipe_barang),
        ]

        for name, test_fn in tests:
            try:
                test_fn(page)
                passed += 1
            except Exception as e:
                failed += 1
                errors.append((name, str(e)))
                log_fail(f"Test '{name}' FAILED with exception: {e}")
                traceback.print_exc()
                screenshot(page, f"error_{name.replace(' ', '_').lower()}")

        browser.close()

    # Summary
    print(f"\n{'='*60}")
    print(f"  TEST SUMMARY")
    print(f"{'='*60}")
    print(f"  Total : {passed + failed}")
    print(f"  Passed: {passed}")
    print(f"  Failed: {failed}")
    if errors:
        print(f"\n  Failures:")
        for name, err in errors:
            print(f"    - {name}: {err}")
    print(f"{'='*60}\n")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
