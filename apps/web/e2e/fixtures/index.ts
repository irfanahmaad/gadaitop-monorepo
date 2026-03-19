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
