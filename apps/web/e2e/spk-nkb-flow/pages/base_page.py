"""
Base Page class for SPK and NKB E2E tests.
Provides common utilities and methods for all pages.
"""
from playwright.sync_api import Page
from utils.helpers import (
    BASE_URL,
    wait_for_data_loaded,
    screenshot,
    log_pass,
    log_fail,
)


class BasePage:
    """Base page class with common utilities."""

    def __init__(self, page: Page):
        self.page = page
        self.base_url = BASE_URL

    def goto(self, path: str = ""):
        """Navigate to a path relative to base URL."""
        url = f"{self.base_url}{path}"
        self.page.goto(url)
        self.page.wait_for_load_state("networkidle")
        return self

    def wait_for_page_ready(self, timeout: int = 15000):
        """Wait for page to be ready (skeletons gone)."""
        if wait_for_data_loaded(self.page, timeout):
            log_pass("Page data loaded")
        else:
            log_fail("Page skeletons still visible after timeout")
        return self

    def screenshot(self, name: str):
        """Take a screenshot."""
        screenshot(self.page, name)
        return self

    def wait_for_selector(self, selector: str, timeout: int = 10000):
        """Wait for a selector to be visible."""
        try:
            self.page.wait_for_selector(selector, timeout=timeout)
            return True
        except Exception:
            return False

    def click_element(self, selector: str):
        """Click an element safely."""
        try:
            self.page.click(selector)
            self.page.wait_for_timeout(500)
            return True
        except Exception as e:
            log_fail(f"Failed to click {selector}: {e}")
            return False

    def fill_input(self, selector: str, value: str):
        """Fill an input field safely."""
        try:
            self.page.fill(selector, value)
            return True
        except Exception as e:
            log_fail(f"Failed to fill {selector}: {e}")
            return False

    def get_text(self, selector: str):
        """Get text content of an element."""
        try:
            return self.page.inner_text(selector)
        except Exception:
            return None

    def is_visible(self, selector: str):
        """Check if an element is visible."""
        try:
            return self.page.locator(selector).is_visible()
        except Exception:
            return False

    def wait_for_url(self, url_pattern: str, timeout: int = 10000):
        """Wait for URL to match pattern."""
        try:
            self.page.wait_for_url(lambda url: url_pattern in url, timeout=timeout)
            return True
        except Exception:
            return False
