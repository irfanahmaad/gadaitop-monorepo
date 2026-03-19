/**
 * Shared Playwright fixtures and helpers for GadaiTop E2E tests.
 */

import { test as base, expect, type Page } from "@playwright/test"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const AUTH_DIR = path.join(__dirname, "../auth")

// ── Auth state paths ──────────────────────────────────────────────────────────
export const AUTH_STATE = {
  adminPt: path.join(AUTH_DIR, "admin-pt.json"),
  staffToko: path.join(AUTH_DIR, "staff-toko.json"),
  superAdmin: path.join(AUTH_DIR, "super-admin.json"),
  customerPortal: path.join(AUTH_DIR, "customer-portal.json"),
}

// ── Fixture types ─────────────────────────────────────────────────────────────
type GadaitopFixtures = {
  /** Navigate to a page and wait for it to be ready */
  gotoAndWait: (path: string) => Promise<void>
}

export const test = base.extend<GadaitopFixtures>({
  gotoAndWait: async ({ page }, use) => {
    const gotoAndWait = async (path: string) => {
      await page.goto(path)
      await page.waitForLoadState("networkidle")
    }
    await use(gotoAndWait)
  },
})

export { expect }

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Wait for a toast notification matching the given text.
 */
export async function waitForToast(page: Page, text: string | RegExp) {
  const toast = page.locator('[data-sonner-toast], [role="status"], .toast')
  await expect(toast.filter({ hasText: text })).toBeVisible({ timeout: 8_000 })
}

/**
 * Wait for a table to be populated (at least one data row).
 */
export async function waitForTableRows(page: Page) {
  await page.waitForSelector("table tbody tr", { timeout: 10_000 })
}

/**
 * Select a combobox option by label text.
 * Works with shadcn Select components.
 */
export async function selectComboboxOption(
  page: Page,
  triggerSelector: string,
  optionText: string,
) {
  await page.locator(triggerSelector).click()
  // Wait for the dropdown to appear
  await page.waitForSelector('[role="listbox"], [cmdk-list]', {
    timeout: 5_000,
  })
  await page.getByRole("option", { name: optionText }).click()
}

/**
 * Fill a numeric currency input (e.g. 5000000 → "5000000").
 */
export async function fillCurrencyInput(
  page: Page,
  selector: string,
  amount: number,
) {
  await page.locator(selector).fill(String(amount))
}

/**
 * Format a number to Indonesian Rupiah format for assertion.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount)
}

/**
 * Wait for skeleton loaders to disappear (data fully loaded).
 */
export async function waitForDataLoaded(page: Page, timeout = 15_000) {
  await page.waitForFunction(
    () => {
      const skeletons = document.querySelectorAll(
        '[class*="skeleton"], [data-slot="skeleton"]',
      )
      return skeletons.length === 0
    },
    { timeout },
  )
}

/**
 * Click the row action menu (⋯) and select a menu item by text.
 */
export async function clickRowAction(
  page: Page,
  rowSelector: string,
  actionText: string,
): Promise<boolean> {
  const row = page.locator(rowSelector).first()
  const actionBtn = row
    .getByRole("button", { name: /buka menu|open menu/i })
    .or(row.locator("button:has(svg.lucide-more-horizontal)"))
    .or(row.locator("td:last-child button"))
    .first()

  if (!(await actionBtn.isVisible())) return false

  await actionBtn.click()
  await page.waitForTimeout(500)

  const menuItem = page.getByRole("menuitem", { name: new RegExp(actionText, "i") })
  if (await menuItem.isVisible()) {
    await menuItem.click()
    return true
  }
  await page.keyboard.press("Escape")
  return false
}

/**
 * Select an option from a Select/Combobox by trigger text and option text.
 */
export async function selectOptionByTrigger(
  page: Page,
  triggerText: string | RegExp,
  optionText: string,
) {
  await page.getByRole("button", { name: triggerText }).click()
  await page.waitForSelector('[role="listbox"], [role="option"]', {
    timeout: 5_000,
  })
  await page.getByRole("option", { name: optionText }).click()
}

// ── Test data constants (from seed data) ──────────────────────────────────────
export const TEST_CUSTOMERS = {
  valid: { nik: "3275012501900001", name: "E2E Test Customer", pin: "123456" },
  payment_test: { nik: "3202020202020002", name: "E2E Payment Test Customer", pin: "222222" },
} as const

export const TEST_ITEMS = {
  hp_android: {
    type: "HP",
    brand: "Samsung",
    model: "A54",
    imei: "123456789012345",
    condition: "mulus",
    completeness: "fullset",
  },
} as const

export const SPK_STATUS = {
  draft: "Draft",
  berjalan: "Berjalan",
  terlambat: "Terlambat",
  lunas: "Lunas",
  terlelang: "Terlelang",
} as const

/**
 * Set loan amount on SPK create form (handles React Hook Form).
 */
export async function setSpkLoanAmount(page: Page, amount: number): Promise<boolean> {
  const result = await page.evaluate(
    (amt) => {
      const loanInput =
        document.querySelector<HTMLInputElement>('input[name="jumlahSPK"]') ??
        document.querySelector<HTMLInputElement>('input[placeholder*="Contoh"]')
      if (loanInput) {
        loanInput.value = String(amt)
        ;["input", "change", "blur"].forEach((ev) =>
          loanInput.dispatchEvent(new Event(ev, { bubbles: true })),
        )
        return { success: true }
      }
      return { success: false }
    },
    amount,
  )
  await page.waitForTimeout(500)
  return result?.success ?? false
}

/**
 * Set customer PIN for SPK via BroadcastChannel (bypasses popup).
 */
export async function setSpkCustomerPin(page: Page, pin: string): Promise<void> {
  await page.evaluate(
    (p) => {
      const ch = new BroadcastChannel("customer-pin-channel")
      ch.postMessage({ type: "PIN_SET", pin: p })
    },
    pin,
  )
  await page.waitForTimeout(1000)
}
