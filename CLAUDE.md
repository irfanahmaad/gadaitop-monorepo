# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Dev
```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:api    # NestJS backend
pnpm build:web    # Next.js frontend

# Development (all apps)
pnpm dev

# Development (single app)
pnpm dev:api      # NestJS backend on port 3001
pnpm dev:web      # Next.js frontend on port 3000
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

## Project Architecture

This is a **monorepo** using **Turborepo** with a **NestJS** backend and **Next.js 15** frontend.

### High-Level Structure

```
gadaitop-monorepo/
├── apps/
│   ├── api/           # NestJS backend (port 3001)
│   └── web/           # Next.js frontend (port 3000)
├── packages/
│   └── ui/            # Shared shadcn/ui components
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

**Key Modules:** auth, user, role, company, branch, customer, spk, nkb, catalog, pawn-term, auction, cash-deposit, cash-mutation, capital-topup, stock-opname, borrow-request, item-type, device, notification, report, audit, dashboard

**Database Migrations:** Located in `src/database/migrations/` with timestamp prefixes. Use the migration commands to manage schema changes.

**Authentication:** JWT-based with NextAuth integration on frontend.

### Frontend (apps/web)

**Framework:** Next.js 15 (App Router), React 19, TypeScript

**Routing:** File-based routing in `app/` directory:
- `app/(auth)/` - Authentication pages
- `app/(dashboard)/*` - Protected dashboard pages
- `app/api/*` - Next.js API routes (for auth callbacks, etc.)

**State Management:** TanStack Query (React Query) with custom hooks in `lib/react-query/hooks/`

**UI Components:** Import from `@workspace/ui/components/*` (shared package)

**Auth:** NextAuth v4 with JWT strategy. Session management via `getSession()` and access tokens.

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
- **Cursor rules:** `.cursor/rules/*.mdc` - Project coding standards (read these before making changes!)

## Common Gotchas

- **Package manager:** This project uses `pnpm` (not npm or yarn)
- **Node version:** Requires Node.js >= 20
- **Environment:** API runs on port 3001, web on port 3000
- **UI components:** Always import from `@workspace/ui/components/*`, never create duplicates
- **Pagination:** Always use API-side pagination, never fetch all and filter client-side
- **Search:** Always debounce the API request value (500ms), keep input value immediate
- **TypeScript:** Both apps have different TS versions (api: 5.5.4, web: 5.9.2) - this is intentional
