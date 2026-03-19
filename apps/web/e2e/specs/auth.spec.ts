/**
 * E2E tests for authentication flows.
 *
 * These tests do NOT use saved auth state — they test login/logout directly.
 *
 * Run: pnpm test:e2e --grep "Auth"
 */

import { test, expect } from "@playwright/test"

// Override project storage state for this file — we test the actual login form
test.use({ storageState: { cookies: [], origins: [] } })

test.describe("Authentication", () => {
  test("should display the login page", async ({ page }) => {
    await page.goto("/login")
    // Two "Selamat Datang" headings exist (left panel h1 + form h2) — check first
    await expect(page.getByRole("heading", { name: /selamat datang/i }).first()).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.getByRole("button", { name: /masuk/i })).toBeVisible()
  })

  test("should show validation errors for empty fields", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /masuk/i }).click()
    // zod validation errors
    await expect(page.getByText(/email harus diisi/i)).toBeVisible()
    await expect(page.getByText(/password harus diisi/i)).toBeVisible()
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[name="email"]').fill("invalid@example.com")
    await page.locator('input[name="password"]').fill("wrongpassword")
    await page.getByRole("button", { name: /masuk/i }).click()

    // Error message should appear
    await expect(
      page.locator('[role="alert"], .text-destructive').filter({
        hasText: /.+/,
      }),
    ).toBeVisible({ timeout: 10_000 })
  })

  test("should login successfully as Admin PT", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[name="email"]').fill("admin.pt001@test.com")
    await page.locator('input[name="password"]').fill("test123")
    await page.getByRole("button", { name: /masuk/i }).click()

    // Should redirect away from login page
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 15_000,
    })
    await expect(page).not.toHaveURL(/\/login/)
  })

  test("should login successfully as Staff Toko", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[name="email"]').fill("staff.jkt001@test.com")
    await page.locator('input[name="password"]').fill("test123")
    await page.getByRole("button", { name: /masuk/i }).click()

    // Staff Toko is redirected to /scan-ktp after login
    await page.waitForURL(
      (url) =>
        !url.pathname.includes("/login"),
      { timeout: 15_000 },
    )
    await expect(page).not.toHaveURL(/\/login/)
  })

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/login")
    const passwordInput = page.locator('input[name="password"]')

    // Initially type="password"
    await expect(passwordInput).toHaveAttribute("type", "password")

    // Click eye icon
    await page.getByRole("button", { name: /tampilkan password/i }).click()
    await expect(passwordInput).toHaveAttribute("type", "text")

    // Click again to hide
    await page.getByRole("button", { name: /sembunyikan password/i }).click()
    await expect(passwordInput).toHaveAttribute("type", "password")
  })

  test("should redirect to login when accessing protected page unauthenticated", async ({
    page,
  }) => {
    await page.goto("/tambah-modal")
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 })
  })

  test("should redirect authenticated user away from login page", async ({
    page,
  }) => {
    // Login first
    await page.goto("/login")
    await page.locator('input[name="email"]').fill("admin.pt001@test.com")
    await page.locator('input[name="password"]').fill("test123")
    await page.getByRole("button", { name: /masuk/i }).click()

    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 15_000,
    })

    // Try to go back to login — should redirect to dashboard
    await page.goto("/login")
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5_000 })
  })
})
