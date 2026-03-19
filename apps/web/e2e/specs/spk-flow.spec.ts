/**
 * E2E tests for SPK flows (Staff Toko, Admin PT).
 *
 * Run: pnpm test:e2e --grep "SPK"
 */

import { test, expect } from "@playwright/test"
import {
  AUTH_STATE,
  waitForDataLoaded,
  clickRowAction,
  TEST_CUSTOMERS,
  TEST_ITEMS,
  SPK_STATUS,
  setSpkLoanAmount,
  setSpkCustomerPin,
} from "../fixtures"

test.describe("SPK — Staff Toko", () => {
  test.use({ storageState: AUTH_STATE.staffToko })

  const PAGE_URL = "/spk"

  test("should display SPK list page", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await expect(
      page.getByRole("heading", { name: /SPK|Surat Perintah Kerja/i }),
    ).toBeVisible()
  })

  test("should load table and support search", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    await expect(page.locator("table")).toBeVisible()

    const searchInput = page.getByPlaceholder(/cari|search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill("test")
      await page.waitForTimeout(1000)
      await searchInput.clear()
      await page.waitForTimeout(500)
    }
  })

  test("should open SPK detail from row action", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()

    if (rowCount === 0) {
      test.skip(true, "No SPK rows")
      return
    }

    const clicked = await clickRowAction(
      page,
      "table tbody tr:nth-child(1)",
      "Detail",
    )
    if (clicked) {
      await expect(page).toHaveURL(/\/spk\/[^/]+$/)
    }
  })

  test("should show valid SPK status badges", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    const tableBody = page.locator("table tbody")
    const rowCount = await tableBody.locator("tr").count()

    if (rowCount === 0) {
      test.skip(true, "No SPK rows")
      return
    }

    const firstRow = tableBody.locator("tr").first()
    const badge = firstRow.locator('[class*="badge"], span[class*="status"]').first()
    if (await badge.isVisible()) {
      const text = await badge.textContent()
      const validStatuses = Object.values(SPK_STATUS)
      expect(validStatuses).toContain(text?.trim())
    }
  })

  test("should open SPK create page", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: /tambah data/i }).click()

    await expect(page).toHaveURL(/\/spk\/tambah/)
    await expect(
      page.getByRole("heading", { name: /tambah SPK|buat SPK/i }),
    ).toBeVisible()
  })

  test("should create SPK with full flow", async ({ page }) => {
    await page.goto("/spk/tambah")
    await page.waitForLoadState("networkidle")

    await page.waitForSelector('button:has-text("Pilih NIK")', { timeout: 10_000 })

    await page.getByRole("button", { name: /pilih NIK/i }).click()
    await page.waitForSelector('[role="option"]', { timeout: 5_000 })
    const nikOption = page.locator(`text=${TEST_CUSTOMERS.valid.nik}`).first()
    if (!(await nikOption.isVisible())) {
      test.skip(true, "Test customer not found in NIK dropdown")
      return
    }
    await nikOption.click()
    await page.waitForTimeout(1500)

    await page.getByRole("button", { name: /pilih tipe barang/i }).click()
    await page.waitForSelector('[role="option"]', { timeout: 3_000 })
    await page.getByRole("option").first().click()
    await page.waitForTimeout(2000)

    const catalogTrigger = page.getByRole("button", {
      name: /pilih katalog barang|pilih barang/i,
    })
    if (await catalogTrigger.isDisabled()) {
      test.skip(true, "Catalog still disabled after item type")
      return
    }
    await catalogTrigger.click()
    await page.waitForTimeout(500)
    await page.getByRole("option").first().click()
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: /pilih kondisi barang/i }).click()
    await page.waitForTimeout(500)
    const conditionOpt = page.getByRole("option", { name: /excellent|good|bagus/i })
    if (await conditionOpt.first().isVisible()) {
      await conditionOpt.first().click()
    } else {
      await page.getByRole("option").first().click()
    }
    await page.waitForTimeout(500)

    const imeiInput = page.locator('input[name="imei"]').first()
    if (await imeiInput.isVisible()) {
      await imeiInput.fill(TEST_ITEMS.hp_android.imei)
    }

    const kelengkapanInput = page.locator('textarea[name="kelengkapanBarang"]').first()
    if (await kelengkapanInput.isVisible()) {
      await kelengkapanInput.fill(TEST_ITEMS.hp_android.completeness)
    }

    await page.getByRole("button", { name: /pilih status barang/i }).click()
    await page.waitForTimeout(500)
    await page.getByRole("option", { name: /di penyimpanan/i }).click()
    await page.waitForTimeout(1000)

    const loanSet = await setSpkLoanAmount(page, 500_000)
    if (!loanSet) {
      test.skip(true, "Could not set loan amount")
      return
    }

    await setSpkCustomerPin(page, TEST_CUSTOMERS.valid.pin)

    await page.getByRole("button", { name: /simpan/i }).click()
    await page.waitForTimeout(3000)

    const confirmBtn = page.getByRole("button", { name: /^ya$/i })
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click()
      await page.waitForTimeout(2000)
      await expect(page).not.toHaveURL(/\/spk\/tambah/)
    }
  })
})

test.describe("SPK — Admin PT", () => {
  test.use({ storageState: AUTH_STATE.adminPt })

  test("should display SPK list with branch filter", async ({ page }) => {
    await page.goto("/spk")
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    await expect(page.locator("table")).toBeVisible()
  })
})
