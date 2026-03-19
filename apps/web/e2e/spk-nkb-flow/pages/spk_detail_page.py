"""
SPK Detail Page Object Model.
"""
from playwright.sync_api import Page
from .base_page import BasePage
from utils.helpers import log_pass, log_fail


class SpkDetailPage(BasePage):
    """SPK detail page for viewing SPK information and NKB history."""

    def __init__(self, page: Page):
        super().__init__(page)
        self.heading_selector = 'h1:has-text("Detail SPK"), h1:has-text("SPK")'
        self.nkb_table_selector = "table tbody tr"
        self.qr_button = 'button:has-text("QR"), button:has-text("Print QR")'
        self.status_badge = '[class*="badge"], span[class*="status"]'

    def goto(self, spk_id: str):
        """Navigate to SPK detail page."""
        super().goto(f"/spk/{spk_id}")
        return self

    def wait_for_page_ready(self):
        """Wait for SPK detail page to be ready."""
        self.wait_for_selector(self.heading_selector, timeout=10000)
        log_pass("SPK detail page loaded")
        return super().wait_for_page_ready()

    def get_spk_status(self) -> str:
        """Get SPK status from badge."""
        badge = self.page.locator(self.status_badge).first
        if badge.is_visible():
            return badge.inner_text()
        return ""

    def get_nkb_count(self) -> int:
        """Get number of NKB records in history table."""
        return self.page.locator(self.nkb_table_selector).count()

    def has_nkb_with_type(self, payment_type: str) -> bool:
        """Check if NKB with payment type exists in table."""
        row = self.page.locator(f'table tbody tr:has-text("{payment_type}")').first
        return row.is_visible()

    def click_qr_button(self):
        """Click QR Code button to generate QR."""
        if self.page.locator(self.qr_button).is_visible():
            self.page.click(self.qr_button)
            self.page.wait_for_timeout(1000)
            log_pass("Clicked QR Code button")
            return True
        return False

    def has_qr_code(self):
        """Check if QR Code is displayed."""
        qr_selector = 'canvas, img[alt*="QR"], [class*="qrcode"]'
        return self.page.locator(qr_selector).is_visible()

    def get_customer_name(self) -> str:
        """Get customer name from detail page."""
        # This selector will depend on the actual page structure
        name_selector = 'h2:has-text("Customer"), [data-test-id="customer-name"]'
        name_elem = self.page.locator(name_selector).first
        if name_elem.is_visible():
            return name_elem.inner_text()
        return ""

    def get_loan_amount(self) -> str:
        """Get loan amount from detail page."""
        amount_selector = '[data-test-id="loan-amount"], span:has-text("Rp")'
        amount_elem = self.page.locator(amount_selector).first
        if amount_elem.is_visible():
            return amount_elem.inner_text()
        return ""
