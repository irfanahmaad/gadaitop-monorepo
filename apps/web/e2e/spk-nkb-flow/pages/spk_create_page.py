"""
SPK Create Page Object Model.
"""
from playwright.sync_api import Page
from .base_page import BasePage
from utils.helpers import log_pass, log_fail, wait_for_toast, get_unique_id
from fixtures.test_data import TEST_ITEMS


class SpkCreatePage(BasePage):
    """SPK creation page for new pawn agreements."""

    def __init__(self, page: Page):
        super().__init__(page)
        self.page_title_selector = 'h1:has-text("Tambah SPK"), h1:has-text("Buat SPK")'
        # Form selectors
        self.customer_search_input = 'input[name="customer"], input[placeholder*="customer"], input[placeholder*="NIK"]'
        self.item_type_select = 'select[name="itemType"], [name="itemType"]'
        self.item_brand_input = 'input[name="brand"], input[name="itemBrand"]'
        self.item_model_input = 'input[name="model"], input[name="itemModel"]'
        self.item_condition_select = 'select[name="condition"], [name="itemCondition"]'
        self.item_completeness_input = 'input[name="completeness"], [name="itemCompleteness"]'
        self.item_imei_input = 'input[name="imei"], input[name="serialNumber"]'
        self.loan_amount_input = 'input[name="loanAmount"], input[type="number"]'
        self.ktp_upload_input = 'input[type="file"][accept*="image"]'
        self.submit_button = 'button[type="submit"]:has-text("Simpan"), button:has-text("Simpan")'
        self.confirm_dialog = '[role="dialog"], [role="alertdialog"]'

    def goto(self):
        """Navigate to SPK create page."""
        super().goto("/spk/tambah")
        return self

    def wait_for_page_ready(self):
        """Wait for SPK create page to be ready."""
        self.wait_for_selector(self.page_title_selector, timeout=10000)
        log_pass("SPK create page loaded")
        return super().wait_for_page_ready()

    def select_customer(self, nik: str):
        """Select customer by NIK."""
        customer_input = self.page.locator(self.customer_search_input).first
        if customer_input.is_visible():
            customer_input.fill(nik)
            self.page.wait_for_timeout(1000)  # Wait for search results
            # Click first result if available
            result = self.page.locator('[role="option"], li:has-text("3201")').first
            if result.is_visible():
                result.click()
                log_pass(f"Selected customer with NIK: {nik}")
                return True
        log_fail(f"Failed to select customer with NIK: {nik}")
        return False

    def fill_item_details(self, item_data: dict):
        """Fill item details."""
        # Item type
        type_select = self.page.locator(self.item_type_select).first
        if type_select.is_visible():
            type_select.select_option(item_data.get("type", "HP"))

        # Brand
        brand_input = self.page.locator(self.item_brand_input).first
        if brand_input.is_visible():
            brand_input.fill(item_data.get("brand", "Samsung"))

        # Model
        model_input = self.page.locator(self.item_model_input).first
        if model_input.is_visible():
            model_input.fill(item_data.get("model", f"E2E Test {get_unique_id()}"))

        # Condition
        condition_select = self.page.locator(self.item_condition_select).first
        if condition_select.is_visible():
            condition_select.select_option(item_data.get("condition", "mulus"))

        # Completeness
        completeness_input = self.page.locator(self.item_completeness_input).first
        if completeness_input.is_visible():
            completeness_input.fill(item_data.get("completeness", "fullset"))

        # IMEI/Serial
        imei_input = self.page.locator(self.item_imei_input).first
        if imei_input.is_visible():
            imei_input.fill(item_data.get("imei", f"{get_unique_id()}" * 3))

        log_pass("Filled item details")
        return True

    def set_loan_amount(self, amount: int):
        """Set loan amount."""
        amount_input = self.page.locator(self.loan_amount_input).first
        if amount_input.is_visible():
            amount_input.fill(str(amount))
            log_pass(f"Set loan amount: {amount}")
            return True
        return False

    def submit(self):
        """Submit SPK form."""
        submit_btn = self.page.locator(self.submit_button).first
        if submit_btn.is_visible():
            submit_btn.click()
            # Wait for confirmation dialog
            self.page.wait_for_timeout(1000)
            if self.page.locator(self.confirm_dialog).count() > 0:
                log_pass("Confirmation dialog appeared")
                return self.confirm_dialog
        log_fail("Failed to submit SPK form")
        return None

    def confirm_submission(self):
        """Confirm SPK submission in dialog."""
        confirm_btn = self.page.locator(f'{self.confirm_dialog} button:has-text("Ya")').first
        if confirm_btn.is_visible():
            confirm_btn.click()
            # Wait for navigation or success message
            self.page.wait_for_timeout(2000)
            log_pass("Confirmed SPK submission")
            return True
        return False

    def create_spk(self, customer_nik: str, item_data: dict, loan_amount: int):
        """Complete SPK creation flow."""
        if not self.select_customer(customer_nik):
            return False

        if not self.fill_item_details(item_data):
            return False

        if not self.set_loan_amount(loan_amount):
            return False

        dialog = self.submit()
        if dialog is None:
            return False

        return self.confirm_submission()

    def is_on_create_page(self):
        """Check if currently on SPK create page."""
        return "/spk/tambah" in self.page.url or "/spk/create" in self.page.url
