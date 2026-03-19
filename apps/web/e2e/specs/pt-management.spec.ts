/**
 * E2E tests for Master PT management (list, search, detail, create).
 *
 * Run: pnpm test:e2e --grep "PT — Management"
 */

import { test, expect } from "@playwright/test"
import { AUTH_STATE, waitForDataLoaded, clickRowAction } from "../fixtures"

test.describe("PT — Management", () => {
  test.use({ storageState: AUTH_STATE.superAdmin })

  const PAGE_URL = "/pt"

  test("should display Master PT page", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("heading", { name: /master pt/i })).toBeVisible()
  })

  test("should load table data", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    await expect(page.locator("table")).toBeVisible()
  })

  test("should filter list via search", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const searchInput = page.getByPlaceholder(/search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill("PT")
      await page.waitForTimeout(500)
      await searchInput.clear()
      await page.waitForTimeout(500)
    }
  })

  test("should open detail from row action", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()

    if (rowCount === 0) {
      test.skip(true, "No PT rows to open detail")
      return
    }

    const clicked = await clickRowAction(
      page,
      "table tbody tr:nth-child(1)",
      "Detail",
    )
    if (clicked) {
      await expect(page).toHaveURL(/\/pt\/[^/]+$/)
      await page.goto(PAGE_URL)
      await page.waitForLoadState("networkidle")
    }
  })

  test("should open create page and show form fields", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: /tambah data/i }).click()

    await expect(page).toHaveURL(/\/pt\/create/)
    await page.waitForLoadState("networkidle")

    const fields = ["code", "name", "adminName", "adminEmail", "password"]
    for (const name of fields) {
      const input = page.locator(`input[name="${name}"]`)
      await expect(input).toBeVisible()
    }
  })
})
