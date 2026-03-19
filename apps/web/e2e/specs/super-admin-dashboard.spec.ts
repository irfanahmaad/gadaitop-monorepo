/**
 * E2E tests for Super Admin dashboard and sidebar navigation.
 *
 * Run: pnpm test:e2e --grep "Super Admin — Dashboard"
 */

import { test, expect } from "@playwright/test"
import { AUTH_STATE, waitForDataLoaded } from "../fixtures"

test.describe("Super Admin — Dashboard", () => {
  test.use({ storageState: AUTH_STATE.superAdmin })

  test("should display dashboard with SPK Aktif metric", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    await expect(page.getByText(/SPK Aktif/i)).toBeVisible({ timeout: 15_000 })
  })

  test("should wait for skeleton loaders to disappear", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    await waitForDataLoaded(page, 20_000)
  })

  test("should navigate via sidebar to Master Super Admin", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    await page.getByRole("link", { name: /master super admin/i }).click()
    await page.waitForLoadState("networkidle")

    await expect(page).toHaveURL(/\/super-admin/)
    await expect(page.getByRole("heading", { name: /super admin/i })).toBeVisible()
  })

  test("should navigate via sidebar to Master PT", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    await page.getByRole("link", { name: /master pt$/i }).click()
    await page.waitForLoadState("networkidle")

    await expect(page).toHaveURL(/\/pt/)
    await expect(page.getByRole("heading", { name: /master pt/i })).toBeVisible()
  })

  test("should navigate via sidebar to Master Tipe Barang", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    await page.getByRole("link", { name: /master tipe barang/i }).click()
    await page.waitForLoadState("networkidle")

    await expect(page).toHaveURL(/\/tipe-barang/)
    await expect(
      page.getByRole("heading", { name: /master tipe barang/i }),
    ).toBeVisible()
  })
})
