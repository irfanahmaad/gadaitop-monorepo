"""
Customer Portal Login Page Object Model.
Uses NIK + PIN authentication instead of email/password.
"""
from playwright.sync_api import Page
from .base_page import BasePage
from utils.helpers import log_pass, log_fail
from fixtures.test_data import CUSTOMER_NIK, CUSTOMER_PIN


class CustomerLoginPage(BasePage):
    """Customer portal login page using NIK + PIN."""

    def __init__(self, page: Page):
        super().__init__(page)
        self.nik_input = 'input[name="nik"], input[placeholder*="NIK"], input[placeholder*="nik"]'
        self.pin_input = 'input[name="pin"], input[type="password"]'
        self.submit_button = 'button[type="submit"], button:has-text("Masuk")'

    def goto(self):
        """Navigate to customer portal login page."""
        super().goto("/portal-customer")
        return self

    def login(self, nik: str = None, pin: str = None):
        """
        Login with provided NIK and PIN or defaults.
        Returns True if login successful.
        """
        nik = nik or CUSTOMER_NIK
        pin = pin or CUSTOMER_PIN

        # Fill NIK
        nik_locator = self.page.locator(self.nik_input).first
        if nik_locator.is_visible():
            nik_locator.fill(nik)
        else:
            log_fail("NIK input not found")
            return False

        # Fill PIN
        pin_locator = self.page.locator(self.pin_input).first
        if pin_locator.is_visible():
            pin_locator.fill(pin)
        else:
            log_fail("PIN input not found")
            return False

        # Submit
        self.page.locator(self.submit_button).first.click()

        try:
            # Wait for navigation to customer portal
            self.page.wait_for_url(
                lambda url: "/portal-customer" in url and "login" not in url,
                timeout=15000
            )
            self.page.wait_for_load_state("networkidle")
            log_pass(f"Customer logged in with NIK: {nik}")
            return True
        except Exception as e:
            log_fail(f"Customer login failed: {e}")
            return False

    def login_as_customer(self):
        """Login with default test customer credentials."""
        return self.login(CUSTOMER_NIK, CUSTOMER_PIN)

    def is_on_customer_login_page(self):
        """Check if currently on customer login page."""
        return "/portal-customer" in self.page.url and "login" in self.page.url
