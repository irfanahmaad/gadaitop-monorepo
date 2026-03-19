"""
Helper utilities for SPK and NKB E2E tests.
Reuses patterns from existing E2E tests.
"""
import os
import re
import time
from pathlib import Path
from playwright.sync_api import Page

# Resolve apps/web root
WEB_ROOT = Path(__file__).resolve().parent.parent.parent


def _load_env_file(path: Path) -> dict[str, str]:
    """Parse .env-style file into key=value dict. Strips optional quotes."""
    out = {}
    if not path.is_file():
        return out
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            m = re.match(r"([A-Za-z_][A-Za-z0-9_]*)=(.*)$", line)
            if m:
                key, val = m.group(1), m.group(2).strip()
                if (val.startswith('"') and val.endswith('"')) or (
                    val.startswith("'") and val.endswith("'")
                ):
                    val = val[1:-1]
                out[key] = val
    return out


def _get_base_url() -> str:
    # 1. Explicit env var
    url = os.environ.get("NEXTAUTH_URL", "").strip()
    if url:
        return url.rstrip("/")
    # 2. .env.local then .env in apps/web
    for name in (".env.local", ".env"):
        env_path = WEB_ROOT / name
        env = _load_env_file(env_path)
        url = env.get("NEXTAUTH_URL", "").strip()
        if url:
            return url.rstrip("/")
    return "http://localhost:3000"


BASE_URL = _get_base_url()
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "../screenshots")


def ensure_dir(path: str):
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)


def screenshot(page: Page, name: str):
    """Take a full page screenshot."""
    ensure_dir(SCREENSHOT_DIR)
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  📸 Screenshot saved: {path}")


def log_step(msg: str):
    """Log a test step header."""
    print(f"\n{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}")


def log_pass(msg: str):
    """Log a passing assertion."""
    print(f"  ✅ PASS: {msg}")


def log_fail(msg: str):
    """Log a failing assertion."""
    print(f"  ❌ FAIL: {msg}")


def log_info(msg: str):
    """Log an info message."""
    print(f"  ℹ️  INFO: {msg}")


def wait_for_data_loaded(page: Page, timeout: int = 15000):
    """Wait for skeleton loaders to disappear."""
    try:
        page.wait_for_function(
            """() => {
                const skeletons = document.querySelectorAll('[class*="skeleton"], [data-slot="skeleton"]');
                return skeletons.length === 0;
            }""",
            timeout=timeout
        )
        return True
    except Exception:
        return False


def wait_for_toast(page: Page, timeout: int = 5000):
    """Wait for a toast notification to appear."""
    try:
        page.wait_for_selector('[role="status"], [data-sonner-toast]', timeout=timeout)
        page.wait_for_timeout(500)
        return True
    except Exception:
        return False


def click_row_action(page: Page, row_selector: str, action_text: str):
    """
    Click the "..." action menu on a data table row, then click a specific menu item.
    Returns True if the menu item was clicked.
    """
    row = page.locator(row_selector).first
    action_btn = row.locator('button:has(svg.lucide-more-horizontal), button:has(.sr-only)').first

    if not action_btn.is_visible():
        # Fallback: try the last button in the row
        action_btn = row.locator("td:last-child button").first

    if not action_btn.is_visible():
        log_fail(f"Action button not found in row")
        return False

    action_btn.click()
    page.wait_for_timeout(500)

    # Wait for dropdown menu to appear
    menu_item = page.locator(f'[role="menuitem"]:has-text("{action_text}")').first
    if menu_item.is_visible():
        menu_item.click()
        return True
    else:
        log_fail(f"Menu item '{action_text}' not visible")
        page.keyboard.press("Escape")
        return False


def get_unique_id() -> str:
    """Generate a unique ID based on timestamp."""
    return f"{int(time.time()) % 100000}"


def format_nkb_number(location: str, date: str) -> str:
    """
    Generate expected NKB number format.
    Format: [LOC]-NKB-[YYYYMMDD]-[4digit]
    Example: JKT001-NKB-20250319-1234
    """
    return f"{location}-NKB-{date}-{get_unique_id()}"


def calculate_expected_interest(principal: int, days: int) -> int:
    """
    Calculate expected interest based on days elapsed.
    - < 15 days: 5% of principal
    - >= 15 days: 10% of principal
    """
    if days < 15:
        return int(principal * 0.05)
    else:
        return int(principal * 0.10)


def calculate_expected_penalty(principal: int, months_late: int) -> int:
    """
    Calculate expected penalty for late payment.
    - 2% per month late
    """
    return int(principal * 0.02 * months_late)
