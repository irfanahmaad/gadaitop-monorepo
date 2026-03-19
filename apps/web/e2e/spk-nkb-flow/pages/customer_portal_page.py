"""
Customer Portal Home Page Object Model.
"""
from playwright.sync_api import Page
from .base_page import BasePage
from utils.helpers import log_pass, log_fail


class CustomerPortalPage(BasePage):
    """Customer portal home page showing customer's active SPKs."""

    def __init__(self, page: Page):
        super().__init__(page)
        self.heading_selector = 'h1:has-text("Portal"), h1:has-text("SPK Saya")'
        self.spk_table_selector = "table tbody tr"
        self.spk_card_selector = '[data-test-id="spk-card"], [class*="spk-card"]'

    def goto(self):
        """Navigate to customer portal home."""
        super().goto("/portal-customer")
        return self

    def wait_for_page_ready(self):
        """Wait for customer portal page to be ready."""
        self.wait_for_selector(self.heading_selector, timeout=10000)
        log_pass("Customer portal page loaded")
        return super().wait_for_page_ready()

    def get_spk_count(self) -> int:
        """Get number of SPKs displayed."""
        # Check for table rows first
        table_rows = self.page.locator(self.spk_table_selector).count()
        if table_rows > 0:
            return table_rows
        # Check for cards
        return self.page.locator(self.spk_card_selector).count()

    def click_spk_detail(self, row_index: int = 1):
        """
        Click to view SPK detail.
        row_index is 1-based (1 = first row/card).
        """
        # Try table row first
        row = self.page.locator(f"table tbody tr:nth-child({row_index}) a").first
        if row.is_visible():
            row.click()
            self.page.wait_for_timeout(1000)
            log_pass(f"Clicked SPK detail at row {row_index}")
            return True
        # Try card click
        card = self.page.locator(f"{self.spk_card_selector}:nth-child({row_index})").first
        if card.is_visible():
            card.click()
            self.page.wait_for_timeout(1000)
            log_pass(f"Clicked SPK card at {row_index}")
            return True
        log_fail(f"Could not click SPK detail at {row_index}")
        return False

    def has_pay_button(self, row_index: int = 1) -> bool:
        """Check if pay button is visible for an SPK."""
        row = self.page.locator(f"table tbody tr:nth-child({row_index})").first
        pay_button = row.locator('button:has-text("Bayar")').first
        return pay_button.is_visible()

    def get_spk_status_badge(self, row_index: int = 1) -> str:
        """Get status badge text from an SPK row."""
        row = self.page.locator(f"table tbody tr:nth-child({row_index})").first
        badge = row.locator('[class*="badge"], span[class*="status"]').first
        if badge.is_visible():
            return badge.inner_text()
        return ""

    def has_spk_with_amount(self, amount: str) -> bool:
        """Check if SPK with loan amount exists."""
        row = self.page.locator(f'table tbody tr:has-text("{amount}")').first
        return row.is_visible()
