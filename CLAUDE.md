# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Dev
```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:api       # NestJS backend
pnpm build:web       # Next.js frontend (dashboard)
pnpm build:marketing # Next.js frontend (landing page)

# Development (all apps)
pnpm dev

# Development (single app)
pnpm dev:api         # NestJS backend on port 3001
pnpm dev:web         # Next.js dashboard on port 3000
pnpm dev:marketing   # Next.js landing page on port 3002
```

### Lint & Format
```bash
# Lint all packages
pnpm lint

# Format code
pnpm format
```

### Database (API)
```bash
# From /apps/api directory
pnpm migration:generate    # Generate a new migration
pnpm migration:run        # Run pending migrations
pnpm migration:check      # Check migration status
pnpm migration:revert     # Revert last migration
pnpm migration:create     # Create empty migration file
pnpm seed                 # Seed database with initial data
pnpm database:reset       # Reset and reseed database
```

### Testing (API)
```bash
# From /apps/api directory
pnpm test           # Unit tests
pnpm test:watch     # Watch mode
pnpm test:e2e       # End-to-end tests
```

### Testing (Web E2E — Playwright)
```bash
# From monorepo root (starts API + web if not running)
pnpm test:e2e              # All E2E tests (headless)
pnpm test:e2e:ui           # Interactive UI mode
pnpm test:e2e:headed       # Headed browser
pnpm test:e2e:report       # Open last HTML report

# Run subsets
pnpm test:e2e:super-admin  # Super Admin, PT, Tipe Barang specs
pnpm test:e2e:spk-nkb      # SPK, Customer Portal, NKB specs

# Or from apps/web with grep
cd apps/web && pnpm test:e2e --grep "Setor Uang"
```

**Note:** E2E uses TypeScript Playwright. Specs live in `apps/web/e2e/specs/`. Auth state is bootstrapped in `auth.setup.ts`. Use `reuseExistingServer: true` — start API and web first for faster runs.

## Project Architecture

This is a **monorepo** using **Turborepo** with a **NestJS** backend and **Next.js 15** frontends.

### High-Level Structure

```
gadaitop-monorepo/
├── apps/
│   ├── api/           # NestJS backend (port 3001)
│   ├── web/           # Next.js dashboard (port 3000)
│   └── marketing/     # Next.js landing page (port 3002)
├── packages/
│   ├── ui/            # Shared shadcn/ui components
│   ├── eslint-config/ # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
└── .cursor/rules/     # Project-specific coding standards
```

### Backend (apps/api)

**Framework:** NestJS with TypeORM, PostgreSQL

**Module Pattern:** Each feature is a module in `src/modules/` with:
- `*.module.ts` - Module definition
- `*.controller.ts` - HTTP endpoints
- `*.service.ts` - Business logic
- `dto/` - Data Transfer Objects (validation with class-validator)
- `*.entity.ts` - TypeORM database entities (often in module root)

**Key Modules:** auth, user, role, company, branch, customer, spk, nkb, catalog, pawn-term, auction, cash-deposit, cash-mutation, capital-topup, stock-opname, borrow-request, item-type, device, notification, report, audit, dashboard, upload, scheduler, health-checker

**Database Migrations:** Located in `src/database/migrations/` with timestamp prefixes. Use the migration commands to manage schema changes.

**Authentication:** JWT-based with NextAuth integration on frontend.

### Frontend (apps/web) - Dashboard

**Framework:** Next.js 15 (App Router), React 19, TypeScript

**Routing:** File-based routing in `app/` directory:
- `app/(auth)/` - Admin authentication pages
- `app/(customer-auth)/` - Customer portal authentication pages
- `app/(customer-portal)/portal-customer/` - Customer portal pages
- `app/(dashboard)/*` - Protected admin dashboard pages
- `app/api/*` - Next.js API routes (for auth callbacks, etc.)

**Dashboard Routes:**
- `master-pengguna/` - User management (admin, staff, super-admin)
- `master-toko/` - Branch/store management
- `master-customer/` - Customer management
- `master-katalog/` - Catalog management
- `master-syarat-mata/` - Pawn term (syarat mata) management
- `tipe-barang/` - Item type management
- `spk/` - SPK (Surat Perintah Kerja) management
- `nkb/` - NKB (Nota Kredit Barang) management
- `lelangan/` - Auction management
- `validasi-lelangan/` - Auction validation
- `setor-uang/` - Cash deposit management
- `mutasi-transaksi/` - Cash mutation management
- `tambah-modal/` - Capital top-up management
- `stock-opname/` - Stock opname management
- `notifikasi/` - Notification center
- `laporan/` - Reports
- `pt/` - Company management
- `scan-ktp/` - KTP (ID card) scanning
- `portal-customer/` - Link to customer portal

**State Management:** TanStack Query (React Query) with custom hooks in `lib/react-query/hooks/`

**UI Components:** Import from `@workspace/ui/components/*` (shared package)

**Auth:** NextAuth v4 with JWT strategy. Session management via `getSession()` and access tokens.

### Frontend (apps/marketing) - Landing Page

**Framework:** Next.js 15 (App Router), React 19, TypeScript

**Purpose:** Public-facing marketing/landing page for GadaiTop

**Structure:**
- Single-page application with hero section, features, pricing, etc.
- Uses Tailwind CSS v4 for styling
- Imports shared UI components from `@workspace/ui`

## Key Patterns & Conventions

### API Client Pattern

The frontend uses a centralized API client (`lib/api/client.ts`):
- `apiClient.get/post/put/patch/delete` - For authenticated requests
- `apiClient.getList` - For paginated list responses
- `createServerApiClient(accessToken)` - For server-side usage

Token caching is handled automatically (5-minute TTL).

### React Query Hooks

Custom hooks in `lib/react-query/hooks/` follow this pattern:
- `use[Entity]` - Fetch single item
- `use[Entity]List` or `use[Entity]s` - Fetch paginated list
- `useCreate[Entity]` - Create mutation
- `useUpdate[Entity]` - Update mutation
- `useDelete[Entity]` - Delete mutation

Query keys are defined in constants (e.g., `userKeys`, `spkKeys`) for cache invalidation.

### Page Layout Standards

**This project enforces strict page layout patterns via Cursor rules.**

**Detail Pages** (`[id]/` or `[slug]/` routes):
- Header with title + breadcrumbs
- Main data card with `lg:grid-cols-[250px_1fr]` layout
- Left: Avatar (size-48, centered)
- Right: Sections with icon + red heading, fields in `md:grid-cols-2`
- Section title: `text-destructive text-lg font-semibold` with icon

**Add/Edit Form Pages** (`tambah/`, `create/`, `*/edit/` routes):
- Same grid layout as detail pages
- Left: Image upload area (circular, `w-48`)
- Right: Form sections with same heading style
- Action buttons: Batal (outline) + Simpan (destructive/red)
- **Save confirmation dialog** before persisting

**List Pages:**
- API-side pagination (default page size 10)
- Debounced search (500ms) - keep input immediate, debounce API value
- `keepPreviousData` to show table during refetch (no full-page skeleton)
- DataTable with server-side pagination

### Row Selection & Bulk Delete

When implementing table row selection:
- Select column with checkboxes (header select-all + row checkboxes)
- Track selected rows via `onSelectionChange` prop
- Show `· N Selected` count in header (with `text-destructive`)
- Show "Hapus" button (destructive) after Filter button when rows selected
- Use `ConfirmationDialog` with `variant="destructive"` before bulk delete
- Clear selection after delete with `resetSelectionKey` prop

### Save Confirmation Dialog

For all save/update actions, use `ConfirmationDialog` with `variant="info"`:
- Flow: Form submit → Validate → Show confirmation → User clicks "Ya" → Execute API
- Props: `title`, `description` (with context), `note="Pastikan kembali sebelum menyimpan data."`, `confirmLabel="Ya"`, `cancelLabel="Batal"`

### CASL Authorization

The app uses CASL for role-based access control:
- `lib/casl/ability.ts` - Ability definitions
- `lib/casl/context.tsx` - Ability provider
- Check permissions with `can()` or `<Can I="action" on="resource">`

## Important File Locations

- **Frontend API types:** `apps/web/lib/api/types.ts` - Shared TypeScript types for API contracts
- **API endpoints:** `apps/web/lib/api/endpoints.ts` - Centralized endpoint URL definitions
- **React Query hooks:** `apps/web/lib/react-query/hooks/` - Custom data fetching hooks
- **DataTable component:** `apps/web/components/data-table.tsx` - Reusable table with pagination/selection
- **ConfirmationDialog:** `apps/web/components/confirmation-dialog.tsx` - Standard confirmation dialog
- **E2E specs:** `apps/web/e2e/specs/` - Playwright TypeScript specs (auth, setor-uang, tambah-modal, super-admin, spk, nkb, customer-portal)
- **E2E fixtures:** `apps/web/e2e/fixtures/index.ts` - Shared helpers, auth state paths, test data
- **Cursor rules:** `.cursor/rules/*.mdc` - Project coding standards (read these before making changes!)

## Common Gotchas

- **Package manager:** This project uses `pnpm` (not npm or yarn)
- **Node version:** Requires Node.js >= 20
- **Environment:**
  - API (NestJS): port 3001
  - Web Dashboard (Next.js): port 3000
  - Marketing Landing (Next.js): port 3002
- **UI components:** Always import from `@workspace/ui/components/*`, never create duplicates
- **Pagination:** Always use API-side pagination, never fetch all and filter client-side
- **Search:** Always debounce the API request value (500ms), keep input value immediate
- **TypeScript:** Different TS versions per app (api: 5.5.4, web: 5.9.2, marketing: 5.9.2) - this is intentional
- **Customer Portal:** Separate auth flow from admin dashboard, uses `(customer-auth)` and `(customer-portal)` route groups
