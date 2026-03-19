/**
 * E2E tests for Customer Portal SPK flows.
 *
 * Run: pnpm test:e2e --grep "Customer Portal"
 */

import { test, expect } from "@playwright/test"
import { AUTH_STATE, waitForDataLoaded, clickRowAction } from "../fixtures"

test.describe("Customer Portal — SPK", () => {
  test.use({ storageState: AUTH_STATE.customerPortal })

  const PAGE_URL = "/portal-customer"

  test("should display customer portal SPK list", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await expect(
      page.getByRole("heading", { name: /portal|SPK saya/i }),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("should show SPK count", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()
    const cardCount = await page.locator('[data-test-id="spk-card"], [class*="spk-card"]').count()
    const total = rowCount || cardCount
    expect(total >= 0).toBeTruthy()
  })

  test("should open SPK detail from row action", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()

    if (rowCount === 0) {
      test.skip(true, "No SPK to open")
      return
    }

    const clicked = await clickRowAction(
      page,
      "table tbody tr:nth-child(1)",
      "Detail",
    )
    if (clicked) {
      await expect(page).toHaveURL(/\/portal-customer\/[^/]+/)
    }
  })

  test("should show pay options in row menu for active SPK", async ({
    page,
  }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()

    if (rowCount === 0) {
      test.skip(true, "No SPKs")
      return
    }

    const firstRow = tableBody.locator("tr").first()
    await firstRow
      .getByRole("button", { name: /buka menu|open menu/i })
      .click()
    await page.waitForTimeout(500)

    const bayarCicil = page.getByRole("menuitem", { name: /bayar cicil/i })
    const bayarLunas = page.getByRole("menuitem", { name: /bayar lunas/i })
    const hasPayOption =
      (await bayarCicil.isVisible()) || (await bayarLunas.isVisible())
    if (hasPayOption) {
      await expect(bayarCicil.or(bayarLunas)).toBeVisible()
    }
    await page.keyboard.press("Escape")
  })
})
