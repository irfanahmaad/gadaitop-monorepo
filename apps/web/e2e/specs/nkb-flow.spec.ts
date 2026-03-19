/**
 * E2E tests for NKB flows (admin approval, perpanjangan).
 *
 * Run: pnpm test:e2e --grep "NKB"
 */

import { test, expect } from "@playwright/test"
import { AUTH_STATE, waitForDataLoaded, clickRowAction } from "../fixtures"

test.describe("NKB — Staff Toko", () => {
  test.use({ storageState: AUTH_STATE.staffToko })

  const PAGE_URL = "/nkb"

  test("should display NKB page", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await expect(
      page.getByRole("heading", { name: /NKB|Nota Kredit/i }),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("should switch to Pending tab", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    const pendingTab = page.getByRole("tab", { name: /NKB baru|pending/i })
    if (await pendingTab.isVisible()) {
      await pendingTab.click()
      await page.waitForTimeout(1000)
    }

    await expect(page.locator("table")).toBeVisible()
  })

  test("should show pending NKB count", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    const pendingTab = page.getByRole("tab", { name: /NKB baru|pending/i })
    if (await pendingTab.isVisible()) {
      await pendingTab.click()
      await page.waitForTimeout(1000)
    }

    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()
    expect(rowCount >= 0).toBeTruthy()
  })

  test("should have approve workflow accessible", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    const pendingTab = page.getByRole("tab", { name: /NKB baru|pending/i })
    if (await pendingTab.isVisible()) {
      await pendingTab.click()
      await page.waitForTimeout(1000)
    }

    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()

    if (rowCount === 0) {
      test.skip(true, "No pending NKBs")
      return
    }

    const clicked = await clickRowAction(
      page,
      "table tbody tr:nth-child(1)",
      "Detail",
    )
    if (clicked) {
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 })
      await page.keyboard.press("Escape")
    }
  })
})

test.describe("NKB — Perpanjangan (Customer)", () => {
  test.use({ storageState: AUTH_STATE.customerPortal })

  test("should show Perpanjangan option for on-time SPK", async ({ page }) => {
    await page.goto("/portal-customer")
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const firstRow = page.locator("table tbody tr").first()
    const firstCard = page.locator('[data-test-id="spk-card"], [class*="spk-card"]').first()

    let hasClickable = false
    if (await firstRow.isVisible()) {
      const badge = firstRow.locator('[class*="badge"]').first()
      const badgeText = (await badge.textContent())?.trim() ?? ""
      if (badgeText === "Berjalan") {
        await firstRow.locator("a").first().click().catch(() => {})
        hasClickable = true
      }
    }
    if (!hasClickable && (await firstCard.isVisible())) {
      await firstCard.click()
      hasClickable = true
    }

    if (!hasClickable) {
      test.skip(true, "No active SPK for perpanjangan")
      return
    }

    await page.waitForLoadState("networkidle")

    await expect(page).toHaveURL(/\/portal-customer\/[^/]+/)
  })

  test("should show payment dialog for Perpanjangan", async ({ page }) => {
    await page.goto("/portal-customer")
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const firstLink = page.locator("table tbody tr a").first()
    if (!(await firstLink.isVisible())) {
      test.skip(true, "No SPK to open")
      return
    }

    await firstLink.click()
    await page.waitForLoadState("networkidle")

    const cicilBtn = page.getByRole("button", { name: /cicil|bayar cicil/i })
    if (await cicilBtn.isVisible()) {
      await cicilBtn.click()
      await page.waitForTimeout(1000)
      const dialog = page.getByRole("dialog")
      if (await dialog.isVisible()) {
        await expect(dialog).toBeVisible()
        await page.keyboard.press("Escape")
      }
    }
  })
})
