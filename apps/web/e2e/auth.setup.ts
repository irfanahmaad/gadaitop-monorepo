/**
 * Global auth setup for Playwright E2E tests.
 *
 * This file logs in as each user type once and saves the browser storage
 * state (cookies + localStorage) so subsequent test files can skip login.
 *
 * Usage in playwright.config.ts:
 *   testMatch: /auth\.setup\.ts/
 *
 * Generated files (git-ignored):
 *   e2e/auth/admin-pt.json
 *   e2e/auth/staff-toko.json
 *   e2e/auth/super-admin.json
 */

import { test as setup, expect } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = "http://localhost:3000"
const AUTH_DIR = path.join(__dirname, "auth")

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true })
}

type UserConfig = {
  email: string
  password: string
  storageFile: string
  label: string
}

const USERS: UserConfig[] = [
  {
    label: "Admin PT",
    email: "admin.pt001@test.com",
    password: "test123",
    storageFile: path.join(AUTH_DIR, "admin-pt.json"),
  },
  {
    label: "Staff Toko",
    email: "staff.jkt001@test.com",
    password: "test123",
    storageFile: path.join(AUTH_DIR, "staff-toko.json"),
  },
  {
    label: "Super Admin",
    email: "admin@gadaitop.com",
    password: "admin123",
    storageFile: path.join(AUTH_DIR, "super-admin.json"),
  },
]

async function loginAs(
  page: import("@playwright/test").Page,
  user: UserConfig,
) {
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState("networkidle")

  // Fill email field
  await page.locator('input[name="email"]').fill(user.email)

  // Fill password field
  await page.locator('input[name="password"]').fill(user.password)

  // Click submit ("Masuk")
  await page.getByRole("button", { name: "Masuk" }).click()

  // Wait for navigation away from login page
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  })

  console.log(`✓ Logged in as ${user.label} (${user.email})`)
}

// We run all user setups in a single test to avoid spawning multiple browsers.
// Each user saves its own storage state file.
setup("authenticate all users", async ({ browser }) => {
  for (const user of USERS) {
    const context = await browser.newContext()
    const page = await context.newPage()

    await loginAs(page, user)

    // Verify we landed on a dashboard page
    await expect(page).not.toHaveURL(/\/login/)

    // Save session cookies & localStorage
    await context.storageState({ path: user.storageFile })
    console.log(`  → Saved state to ${path.basename(user.storageFile)}`)

    await context.close()
  }
})
