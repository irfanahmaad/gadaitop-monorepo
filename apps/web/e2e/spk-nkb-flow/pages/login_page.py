"""
Admin Login Page Object Model.
"""
from playwright.sync_api import Page
from .base_page import BasePage
from utils.helpers import log_pass, log_fail
from fixtures.test_data import STAFF_EMAIL, STAFF_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD


class LoginPage(BasePage):
    """Admin login page for staff and company admin."""

    def __init__(self, page: Page):
        super().__init__(page)
        self.email_input = 'input[name="email"]'
        self.password_input = 'input[name="password"]'
        self.submit_button = 'button[type="submit"]'

    def goto(self):
        """Navigate to login page."""
        super().goto("/login")
        return self

    def login(self, email: str = None, password: str = None):
        """
        Login with provided credentials or defaults.
        Returns True if login successful.
        """
        email = email or STAFF_EMAIL
        password = password or STAFF_PASSWORD

        self.page.fill(self.email_input, email)
        self.page.fill(self.password_input, password)
        self.page.click(self.submit_button)

        try:
            # Wait for navigation away from login page
            self.page.wait_for_url(
                lambda url: "login" not in url,
                timeout=15000
            )
            self.page.wait_for_load_state("networkidle")
            log_pass(f"Logged in as {email}")
            return True
        except Exception as e:
            log_fail(f"Login failed: {e}")
            return False

    def login_as_staff(self):
        """Login as branch staff."""
        return self.login(STAFF_EMAIL, STAFF_PASSWORD)

    def login_as_admin(self):
        """Login as company admin."""
        return self.login(ADMIN_EMAIL, ADMIN_PASSWORD)

    def is_on_login_page(self):
        """Check if currently on login page."""
        return "login" in self.page.url
