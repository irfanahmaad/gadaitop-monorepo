"""
NKB List Page Object Model (Admin).
"""
from playwright.sync_api import Page
from .base_page import BasePage
from utils.helpers import log_pass, log_fail, click_row_action


class NkbListPage(BasePage):
    """NKB list page for admin to approve/reject payments."""

    def __init__(self, page: Page):
        super().__init__(page)
        self.heading_selector = 'h1:has-text("NKB"), h1:has-text("Nota Kredit")'
        # Tabs
        self.tab_pending = 'button:has-text("NKB Baru"), button:has-text("Pending")'
        self.tab_history = 'button:has-text("History"), button:has-text("Riwayat")'
        # Table
        self.table_selector = "table tbody tr"
        # Actions
        self.approve_button = 'button:has-text("Setuju"), button:has-text("Approve")'
        self.reject_button = 'button:has-text("Tolak"), button:has-text("Reject")'

    def goto(self):
        """Navigate to NKB list page."""
        super().goto("/nkb")
        return self

    def wait_for_page_ready(self):
        """Wait for NKB list page to be ready."""
        self.wait_for_selector(self.heading_selector, timeout=10000)
        log_pass("NKB list page loaded")
        return super().wait_for_page_ready()

    def goto_pending_tab(self):
        """Navigate to Pending NKB tab."""
        if self.page.locator(self.tab_pending).is_visible():
            self.page.click(self.tab_pending)
            self.page.wait_for_timeout(1000)
            log_pass("Switched to Pending NKB tab")
            return True
        return False

    def goto_history_tab(self):
        """Navigate to History NKB tab."""
        if self.page.locator(self.tab_history).is_visible():
            self.page.click(self.tab_history)
            self.page.wait_for_timeout(1000)
            log_pass("Switched to History NKB tab")
            return True
        return False

    def get_nkb_count(self) -> int:
        """Get number of NKBs in current tab."""
        return self.page.locator(self.table_selector).count()

    def approve_nkb(self, row_index: int = 1):
        """
        Approve pending NKB.
        row_index is 1-based (1 = first row).
        """
        # Click action menu on row
        row_selector = f"table tbody tr:nth-child({row_index})"
        if click_row_action(self.page, row_selector, "Detail"):
            # Wait for detail dialog
            self.page.wait_for_timeout(1000)
            # Click approve button if visible
            approve_btn = self.page.locator(self.approve_button).first
            if approve_btn.is_visible():
                approve_btn.click()
                # Confirm if dialog appears
                self.page.wait_for_timeout(1000)
                confirm_btn = self.page.locator('button:has-text("Ya")').first
                if confirm_btn.is_visible():
                    confirm_btn.click()
                log_pass(f"Approved NKB at row {row_index}")
                return True
        log_fail(f"Failed to approve NKB at row {row_index}")
        return False

    def reject_nkb(self, row_index: int = 1, reason: str = "Test rejection"):
        """
        Reject pending NKB with reason.
        row_index is 1-based (1 = first row).
        """
        row_selector = f"table tbody tr:nth-child({row_index})"
        if click_row_action(self.page, row_selector, "Detail"):
            self.page.wait_for_timeout(1000)
            reject_btn = self.page.locator(self.reject_button).first
            if reject_btn.is_visible():
                reject_btn.click()
                # Fill rejection reason if dialog appears
                self.page.wait_for_timeout(500)
                reason_input = self.page.locator('textarea, input[type="text"]').first
                if reason_input.is_visible():
                    reason_input.fill(reason)
                # Confirm rejection
                confirm_btn = self.page.locator('button:has-text("Ya")').first
                if confirm_btn.is_visible():
                    confirm_btn.click()
                log_pass(f"Rejected NKB at row {row_index}")
                return True
        log_fail(f"Failed to reject NKB at row {row_index}")
        return False

    def has_nkb_with_number(self, nkb_number: str) -> bool:
        """Check if NKB with number exists in table."""
        row = self.page.locator(f'table tbody tr:has-text("{nkb_number}")').first
        return row.is_visible()

    def get_nkb_status(self, row_index: int = 1) -> str:
        """Get status badge text from a row."""
        row = self.page.locator(f"table tbody tr:nth-child({row_index})").first
        badge = row.locator('[class*="badge"], span[class*="status"]').first
        if badge.is_visible():
            return badge.inner_text()
        return ""
