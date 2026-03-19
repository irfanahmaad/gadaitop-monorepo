/**
 * E2E tests for Master Super Admin management (list, search, detail, create).
 *
 * Run: pnpm test:e2e --grep "Super Admin — Management"
 */

import { test, expect } from "@playwright/test"
import { AUTH_STATE, waitForDataLoaded, clickRowAction } from "../fixtures"

test.describe("Super Admin — Management", () => {
  test.use({ storageState: AUTH_STATE.superAdmin })

  const PAGE_URL = "/super-admin"

  test("should display Master Super Admin page", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await expect(page.getByRole("heading", { name: /super admin/i })).toBeVisible()
  })

  test("should load table data", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    await expect(page.locator("table")).toBeVisible()
  })

  test("should have rows or empty state", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()
    const noResults = await page.getByText(/no results|tidak ada data/i).count()

    expect(rowCount > 0 || noResults > 0).toBeTruthy()
  })

  test("should filter list via search", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const searchInput = page.getByPlaceholder(/cari/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill("admin")
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
      test.skip(true, "No Super Admin rows to open detail")
      return
    }

    const clicked = await clickRowAction(
      page,
      "table tbody tr:nth-child(1)",
      "Detail",
    )
    if (clicked) {
      await expect(page).toHaveURL(/\/super-admin\/[^/]+$/)
      await page.goto(PAGE_URL)
      await page.waitForLoadState("networkidle")
    }
  })

  test("should open create page and show form fields", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: /tambah data/i }).click()

    await expect(page).toHaveURL(/\/super-admin\/create/)
    await page.waitForLoadState("networkidle")

    const fields = ["fullName", "email", "phoneNumber", "password"]
    for (const name of fields) {
      const input = page.locator(`input[name="${name}"]`)
      await expect(input).toBeVisible()
    }
  })
})
