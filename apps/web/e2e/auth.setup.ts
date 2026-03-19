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
 *   e2e/auth/customer-portal.json
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

type StaffUserConfig = {
  type: "staff"
  email: string
  password: string
  storageFile: string
  label: string
}

type CustomerUserConfig = {
  type: "customer"
  nik: string
  pin: string
  storageFile: string
  label: string
}

const STAFF_USERS: StaffUserConfig[] = [
  {
    type: "staff",
    label: "Admin PT",
    email: "admin.pt001@test.com",
    password: "test123",
    storageFile: path.join(AUTH_DIR, "admin-pt.json"),
  },
  {
    type: "staff",
    label: "Staff Toko",
    email: "staff.jkt001@test.com",
    password: "test123",
    storageFile: path.join(AUTH_DIR, "staff-toko.json"),
  },
  {
    type: "staff",
    label: "Super Admin",
    email: "admin@gadaitop.com",
    password: "admin123",
    storageFile: path.join(AUTH_DIR, "super-admin.json"),
  },
]

const CUSTOMER_USER: CustomerUserConfig = {
  type: "customer",
  label: "Customer Portal",
  nik: process.env.E2E_CUSTOMER_NIK ?? "3275012501900001",
  pin: process.env.E2E_CUSTOMER_PIN ?? "123456",
  storageFile: path.join(AUTH_DIR, "customer-portal.json"),
}

async function loginAsStaff(
  page: import("@playwright/test").Page,
  user: StaffUserConfig,
) {
  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState("networkidle")

  await page.locator('input[name="email"]').fill(user.email)
  await page.locator('input[name="password"]').fill(user.password)
  await page.getByRole("button", { name: "Masuk" }).click()

  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15_000,
  })

  console.log(`✓ Logged in as ${user.label} (${user.email})`)
}

async function loginAsCustomer(
  page: import("@playwright/test").Page,
  user: CustomerUserConfig,
) {
  await page.goto(`${BASE_URL}/portal-customer/login`)
  await page.waitForLoadState("networkidle")

  await page.locator('input[name="nik"]').fill(user.nik)
  await page.locator('input[name="pin"]').fill(user.pin)
  await page.getByRole("button", { name: /masuk/i }).click()

  await page.waitForURL(
    (url) =>
      url.pathname.startsWith("/portal-customer") &&
      !url.pathname.includes("/login"),
    { timeout: 15_000 },
  )

  console.log(`✓ Logged in as ${user.label} (NIK: ${user.nik})`)
}

// We run all user setups in a single test to avoid spawning multiple browsers.
setup("authenticate all users", async ({ browser }) => {
  for (const user of STAFF_USERS) {
    const context = await browser.newContext()
    const page = await context.newPage()

    await loginAsStaff(page, user)

    await expect(page).not.toHaveURL(/\/login/)

    await context.storageState({ path: user.storageFile })
    console.log(`  → Saved state to ${path.basename(user.storageFile)}`)

    await context.close()
  }

  // Customer portal (NIK + PIN)
  const context = await browser.newContext()
  const page = await context.newPage()

  await loginAsCustomer(page, CUSTOMER_USER)

  await expect(page).toHaveURL(/\/portal-customer/)
  await expect(page).not.toHaveURL(/\/portal-customer\/login/)

  await context.storageState({ path: CUSTOMER_USER.storageFile })
  console.log(`  → Saved state to ${path.basename(CUSTOMER_USER.storageFile)}`)

  await context.close()
})
