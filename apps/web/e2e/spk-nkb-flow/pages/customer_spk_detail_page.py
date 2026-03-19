"""
Customer SPK Detail Page Object Model with Payment Dialog.
"""
from playwright.sync_api import Page
from .base_page import BasePage
from utils.helpers import log_pass, log_fail


class CustomerSpkDetailPage(BasePage):
    """Customer SPK detail page with payment options."""

    def __init__(self, page: Page):
        super().__init__(page)
        self.heading_selector = 'h1:has-text("Detail"), h1:has-text("SPK")'
        # Payment buttons
        self.pay_installment_button = 'button:has-text("Cicil"), button:has-text("Bayar Cicil")'
        self.pay_full_button = 'button:has-text("Lunas"), button:has-text("Bayar Lunas")'
        # Payment dialog
        self.payment_dialog = '[role="dialog"]:has-text("Bayar"), [role="dialog"]:has-text("Pembayaran")'
        self.payment_method_cash = 'input[value="cash"], label:has-text("Tunai"), label:has-text("Cash")'
        self.payment_method_transfer = 'input[value="transfer"], label:has-text("Transfer")'
        self.principal_input = 'input[name="principal"], input[type="number"]'
        self.payment_submit = 'button[type="submit"]:has-text("Bayar"), button:has-text("Konfirmasi")'

    def goto(self, spk_id: str):
        """Navigate to customer SPK detail page."""
        super().goto(f"/portal-customer/{spk_id}")
        return self

    def wait_for_page_ready(self):
        """Wait for SPK detail page to be ready."""
        self.wait_for_selector(self.heading_selector, timeout=10000)
        log_pass("Customer SPK detail page loaded")
        return super().wait_for_page_ready()

    def has_pay_installment_button(self) -> bool:
        """Check if pay installment (cicil) button is visible."""
        return self.page.locator(self.pay_installment_button).is_visible()

    def has_pay_full_button(self) -> bool:
        """Check if pay full (lunas) button is visible."""
        return self.page.locator(self.pay_full_button).is_visible()

    def click_pay_installment(self):
        """Click pay installment button to open payment dialog."""
        if self.has_pay_installment_button():
            self.page.click(self.pay_installment_button)
            self.page.wait_for_timeout(1000)
            log_pass("Clicked Pay Installment button")
            return self.wait_for_payment_dialog()
        log_fail("Pay Installment button not found")
        return False

    def click_pay_full(self):
        """Click pay full (lunas) button to open payment dialog."""
        if self.has_pay_full_button():
            self.page.click(self.pay_full_button)
            self.page.wait_for_timeout(1000)
            log_pass("Clicked Pay Full button")
            return self.wait_for_payment_dialog()
        log_fail("Pay Full button not found")
        return False

    def wait_for_payment_dialog(self) -> bool:
        """Wait for payment dialog to appear."""
        if self.page.locator(self.payment_dialog).is_visible():
            log_pass("Payment dialog opened")
            return True
        return False

    def select_payment_method(self, method: str = "cash"):
        """Select payment method (cash or transfer)."""
        dialog = self.page.locator(self.payment_dialog).first
        if method == "cash":
            selector = dialog.locator(self.payment_method_cash).first
        else:
            selector = dialog.locator(self.payment_method_transfer).first

        if selector.is_visible():
            selector.click()
            log_pass(f"Selected payment method: {method}")
            return True
        return False

    def enter_principal_amount(self, amount: int):
        """Enter principal payment amount."""
        dialog = self.page.locator(self.payment_dialog).first
        principal_input = dialog.locator(self.principal_input).first
        if principal_input.is_visible():
            principal_input.fill(str(amount))
            log_pass(f"Entered principal amount: {amount}")
            return True
        return False

    def get_payment_summary(self) -> dict:
        """Get payment summary from dialog (principal, interest, total)."""
        dialog = self.page.locator(self.payment_dialog).first
        summary = {}

        # Look for summary elements - selectors will depend on actual implementation
        principal_elem = dialog.locator('[data-test-id="principal"], span:has-text("Pokok")').first
        interest_elem = dialog.locator('[data-test-id="interest"], span:has-text("Bunga")').first
        total_elem = dialog.locator('[data-test-id="total"], span:has-text("Total")').first

        if principal_elem.is_visible():
            summary["principal"] = principal_elem.inner_text()
        if interest_elem.is_visible():
            summary["interest"] = interest_elem.inner_text()
        if total_elem.is_visible():
            summary["total"] = total_elem.inner_text()

        return summary

    def submit_payment(self):
        """Submit payment in dialog."""
        dialog = self.page.locator(self.payment_dialog).first
        submit_btn = dialog.locator(self.payment_submit).first
        if submit_btn.is_visible():
            submit_btn.click()
            # Wait for confirmation dialog
            self.page.wait_for_timeout(1000)
            # Click confirm if dialog appears
            confirm_btn = self.page.locator('button:has-text("Ya"), button:has-text("Konfirmasi")').first
            if confirm_btn.is_visible():
                confirm_btn.click()
            self.page.wait_for_timeout(2000)
            log_pass("Submitted payment")
            return True
        return False

    def make_payment(self, payment_type: str = "installment", amount: int = 50000, method: str = "cash"):
        """
        Complete payment flow.
        payment_type: 'installment' or 'full'
        amount: principal amount (for installment)
        method: 'cash' or 'transfer'
        """
        if payment_type == "installment":
            if not self.click_pay_installment():
                return False
        else:
            if not self.click_pay_full():
                return False

        if not self.wait_for_payment_dialog():
            return False

        if not self.select_payment_method(method):
            return False

        # For installment, enter principal amount
        if payment_type == "installment":
            if not self.enter_principal_amount(amount):
                return False

        return self.submit_payment()

    def get_spk_status(self) -> str:
        """Get current SPK status."""
        badge = self.page.locator('[class*="badge"], span[class*="status"]').first
        if badge.is_visible():
            return badge.inner_text()
        return ""
