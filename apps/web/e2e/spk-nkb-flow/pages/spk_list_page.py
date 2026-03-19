"""
SPK List Page Object Model.
"""
from playwright.sync_api import Page
from .base_page import BasePage
from utils.helpers import log_pass, log_fail, wait_for_data_loaded


class SpkListPage(BasePage):
    """SPK list page for viewing and filtering SPK records."""

    def __init__(self, page: Page):
        super().__init__(page)
        self.heading_selector = 'h1:has-text("SPK"), h1:has-text("Surat Perintah Kerja")'
        self.table_selector = "table tbody tr"
        self.search_input = 'input[placeholder*="Cari"], input[placeholder*="Search"]'
        self.tambah_button = 'button:has-text("Tambah Data")'
        # Filter selectors
        self.branch_filter = '[data-test-id="branch-filter"], select:has-text("Cabang")'
        self.date_filter = '[data-test-id="date-filter"], input[type="date"]'
        self.amount_filter = '[data-test-id="amount-filter"]'

    def goto(self):
        """Navigate to SPK list page."""
        super().goto("/spk")
        return self

    def wait_for_page_ready(self):
        """Wait for SPK list page to be ready."""
        self.wait_for_selector(self.heading_selector, timeout=10000)
        log_pass("SPK list page heading visible")
        return super().wait_for_page_ready()

    def get_row_count(self):
        """Get number of SPK rows in table."""
        return self.page.locator(self.table_selector).count()

    def search(self, query: str):
        """Search SPK by query."""
        search_locator = self.page.locator(self.search_input).first
        if search_locator.is_visible():
            search_locator.fill(query)
            self.page.wait_for_timeout(1000)  # Wait for debounce
            log_pass(f"Searched for: {query}")
            return True
        return False

    def clear_search(self):
        """Clear search input."""
        search_locator = self.page.locator(self.search_input).first
        if search_locator.is_visible():
            search_locator.clear()
            self.page.wait_for_timeout(500)
            return True
        return False

    def click_tambah(self):
        """Click Tambah Data button to create new SPK."""
        if self.page.locator(self.tambah_button).is_visible():
            self.page.click(self.tambah_button)
            self.page.wait_for_timeout(1000)
            log_pass("Clicked Tambah Data")
            return True
        log_fail("Tambah Data button not found")
        return False

    def click_row_detail(self, row_index: int = 1):
        """
        Click Detail action on a row.
        row_index is 1-based (1 = first row).
        """
        from utils.helpers import click_row_action
        row_selector = f"table tbody tr:nth-child({row_index})"
        return click_row_action(self.page, row_selector, "Detail")

    def get_spk_status_badge(self, row_index: int = 1) -> str:
        """Get status badge text from a row."""
        row = self.page.locator(f"table tbody tr:nth-child({row_index})").first
        badge = row.locator('[class*="badge"], span[class*="status"]').first
        if badge.is_visible():
            return badge.inner_text()
        return ""

    def filter_by_branch(self, branch_code: str):
        """Filter SPK list by branch."""
        # This will depend on the actual filter UI implementation
        branch_filter = self.page.locator(self.branch_filter).first
        if branch_filter.is_visible():
            branch_filter.select_option(branch_code)
            self.page.wait_for_timeout(1000)
            log_pass(f"Filtered by branch: {branch_code}")
            return True
        return False

    def has_spk_with_customer_name(self, name: str) -> bool:
        """Check if SPK with customer name exists in table."""
        row = self.page.locator(f'table tbody tr:has-text("{name}")').first
        return row.is_visible()
