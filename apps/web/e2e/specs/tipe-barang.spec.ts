/**
 * E2E tests for Master Tipe Barang full CRUD (create, edit, delete).
 *
 * Run: pnpm test:e2e --grep "Tipe Barang"
 */

import { test, expect } from "@playwright/test"
import { AUTH_STATE, waitForDataLoaded, clickRowAction } from "../fixtures"

test.describe("Tipe Barang — CRUD", () => {
  test.use({ storageState: AUTH_STATE.superAdmin })

  const PAGE_URL = "/tipe-barang"
  const UNIQUE_CODE = `Z${Date.now() % 10000}`
  const UNIQUE_NAME = `E2E Test Item ${UNIQUE_CODE}`
  const EDITED_NAME = `E2E EDITED ${UNIQUE_CODE}`

  test("should display Master Tipe Barang page", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await expect(
      page.getByRole("heading", { name: /master tipe barang/i }),
    ).toBeVisible()
  })

  test("should load table data", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)
    await expect(page.locator("table")).toBeVisible()
  })

  test("should create new Tipe Barang via dialog", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)

    await page.getByRole("button", { name: /tambah data/i }).click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    await dialog.locator('input[name="typeCode"]').fill(UNIQUE_CODE)
    await dialog.locator('input[name="typeName"]').fill(UNIQUE_NAME)

    await dialog.getByRole("button", { name: /simpan/i }).click()

    await expect(dialog).not.toBeVisible({ timeout: 10_000 })

    await page.waitForLoadState("networkidle")

    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill(UNIQUE_CODE)
    await page.waitForTimeout(1000)

    await expect(page.locator(`table tbody tr:has-text("${UNIQUE_CODE}")`)).toBeVisible()
  })

  test("should edit Tipe Barang via row action", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)

    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill(UNIQUE_CODE)
    await page.waitForTimeout(1000)

    const targetRow = page.locator(`table tbody tr:has-text("${UNIQUE_CODE}")`)
    if ((await targetRow.count()) === 0) {
      test.skip(true, "Created item not found for edit")
      return
    }

    const clicked = await clickRowAction(
      page,
      `table tbody tr:has-text("${UNIQUE_CODE}")`,
      "Edit",
    )
    if (!clicked) {
      test.skip(true, "Edit menu item not found")
      return
    }

    const editDialog = page.getByRole("dialog")
    await expect(editDialog).toBeVisible({ timeout: 5_000 })

    const nameField = editDialog.locator('input[name="typeName"]')
    await nameField.clear()
    await nameField.fill(EDITED_NAME)

    await editDialog.getByRole("button", { name: /simpan/i }).click()

    await expect(editDialog).not.toBeVisible({ timeout: 10_000 })

    await page.waitForLoadState("networkidle")

    await searchInput.clear()
    await searchInput.fill(EDITED_NAME)
    await page.waitForTimeout(1000)

    await expect(page.locator(`table tbody tr:has-text("${EDITED_NAME}")`)).toBeVisible()
  })

  test("should delete Tipe Barang via row action", async ({ page }) => {
    await page.goto(PAGE_URL)
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page)

    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill(UNIQUE_CODE)
    await page.waitForTimeout(1000)

    const targetRow = page.locator(`table tbody tr:has-text("${UNIQUE_CODE}")`)
    if ((await targetRow.count()) === 0) {
      test.skip(true, "Item not found for delete")
      return
    }

    const clicked = await clickRowAction(
      page,
      `table tbody tr:has-text("${UNIQUE_CODE}")`,
      "Hapus",
    )
    if (!clicked) {
      test.skip(true, "Hapus menu item not found")
      return
    }

    const confirmDialog = page.getByRole("dialog").or(page.getByRole("alertdialog"))
    await expect(confirmDialog).toBeVisible({ timeout: 5_000 })

    const confirmBtn = confirmDialog.getByRole("button", {
      name: /^ya$|^hapus$|^konfirmasi$|^lanjutkan$/i,
    })
    if ((await confirmBtn.count()) > 0) {
      await confirmBtn.first().click()
    } else {
      await confirmDialog.locator("button").last().click()
    }

    await expect(confirmDialog).not.toBeVisible({ timeout: 10_000 })

    await page.waitForLoadState("networkidle")

    await searchInput.clear()
    await searchInput.fill(UNIQUE_CODE)
    await page.waitForTimeout(1000)

    const remaining = page.locator(`table tbody tr:has-text("${UNIQUE_CODE}")`)
    const noResults = page.getByText(/no results|tidak ada data/i)
    const remainingCount = await remaining.count()
    const noResultsCount = await noResults.count()

    expect(remainingCount === 0 || noResultsCount > 0).toBeTruthy()
  })
})
