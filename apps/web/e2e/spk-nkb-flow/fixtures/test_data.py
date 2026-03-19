"""
Test data fixtures for SPK and NKB E2E tests.
"""
import os
from utils.helpers import get_unique_id

# ── Environment Credentials ──────────────────────────────────────────────────────

STAFF_EMAIL = os.environ.get("E2E_STAFF_EMAIL", "staff.jkt001@test.com")
STAFF_PASSWORD = os.environ.get("E2E_STAFF_PASSWORD", "test123")

ADMIN_EMAIL = os.environ.get("E2E_ADMIN_EMAIL", "admin.pt001@test.com")
ADMIN_PASSWORD = os.environ.get("E2E_ADMIN_PASSWORD", "test123")

# Customer portal uses NIK + PIN (not email/password)
CUSTOMER_NIK = os.environ.get("E2E_CUSTOMER_NIK", "1234567890123456")
CUSTOMER_PIN = os.environ.get("E2E_CUSTOMER_PIN", "123456")

# ── Test Customers ────────────────────────────────────────────────────────────────

TEST_CUSTOMERS = {
    "valid": {
        "nik": "3275012501900001",
        "name": "E2E Test Customer",
        "pin": "123456",
    },
    "blacklist": {
        "nik": "9999999999999999",
        "name": "E2E Blacklist Customer",
        "pin": "999999",
    },
    "payment_test": {
        "nik": "3202020202020002",
        "name": "E2E Payment Test Customer",
        "pin": "222222",
    },
}

# ── Test Items ───────────────────────────────────────────────────────────────────

TEST_ITEMS = {
    "hp_android": {
        "type": "HP",
        "brand": "Samsung",
        "model": "A54",
        "imei": "123456789012345",
        "condition": "mulus",
        "completeness": "fullset",
    },
    "laptop": {
        "type": "Laptop",
        "brand": "ASUS",
        "model": "Vivobook",
        "serial": "ABC12345",
        "condition": "lecet sedikit",
        "completeness": "laptop only",
    },
    "tablet": {
        "type": "Tablet",
        "brand": "iPad",
        "model": "Pro 11",
        "serial": "IPAD123456",
        "condition": "mulus",
        "completeness": "fullset",
    },
}

# ── Test Payments ────────────────────────────────────────────────────────────────

TEST_PAYMENTS = {
    "principal_min": 50000,  # Minimum principal payment
    "principal_partial": 100000,
    "principal_full": 1000000,  # Will be calculated dynamically
    "admin_fee": 5000,
    "insurance_fee": 10000,
}

# ── Test SPK Data ────────────────────────────────────────────────────────────────

def generate_test_spk_data(suffix: str = None) -> dict:
    """Generate unique test SPK data."""
    unique_id = suffix or get_unique_id()
    return {
        "customer_nik": TEST_CUSTOMERS["valid"]["nik"],
        "item_type": TEST_ITEMS["hp_android"]["type"],
        "item_brand": TEST_ITEMS["hp_android"]["brand"],
        "item_model": f"E2E Test {unique_id}",
        "item_condition": TEST_ITEMS["hp_android"]["condition"],
        "item_completeness": TEST_ITEMS["hp_android"]["completeness"],
        "item_imei": f"{get_unique_id()}" * 3,  # 15 digit IMEI
        "loan_amount": 500000,
    }

# ── Branch Codes ─────────────────────────────────────────────────────────────────

BRANCH_CODES = {
    "jkt001": "JKT001",
    "bdg001": "BDG001",
    "sby001": "SBY001",
}

# ── Expected SPK Status Values ────────────────────────────────────────────────────

SPK_STATUS = {
    "draft": "Draft",
    "berjalan": "Berjalan",
    "terlambat": "Terlambat",
    "lunas": "Lunas",
    "terlelang": "Terlelang",
}

# ── Expected NKB Status Values ────────────────────────────────────────────────────

NKB_STATUS = {
    "pending": "pending",
    "confirmed": "confirmed",
    "rejected": "rejected",
}

# ── NKB Payment Types ────────────────────────────────────────────────────────────

NKB_PAYMENT_TYPES = {
    "pelunasan": "Pelunasan",
    "perpanjangan": "Perpanjangan",
    "cicil": "Cicilan",
}
