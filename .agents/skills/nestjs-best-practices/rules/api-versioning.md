---
title: Use API Versioning for Breaking Changes
impact: MEDIUM
impactDescription: Versioning allows you to evolve APIs without breaking existing clients
tags: api, versioning, breaking-changes, compatibility
---

## Use API Versioning for Breaking Changes

Use NestJS built-in versioning so all routes are versioned consistently. In `main.ts` set a global prefix (e.g. `api`), then enable URI versioning with a default version (e.g. `1`). Controllers declare version via `@Controller({ path: 'resource', version: '1' })`, producing routes like `/api/v1/resource`.

**Incorrect (breaking changes without versioning):**

```typescript
// Breaking changes without versioning
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    // Original response: { id, name, email }
    // Later changed to: { id, firstName, lastName, emailAddress }
    // Old clients break!
    return this.usersService.findOne(id);
  }
}

// Manual versioning in routes
@Controller('v1/users')
export class UsersV1Controller {}

@Controller('v2/users')
export class UsersV2Controller {}
// Inconsistent, error-prone, hard to maintain
```

**Correct (URI versioning + controller-level version — align with apps/api):**

```typescript
// main.ts
app.setGlobalPrefix('api');
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
// Routes: /api/v1/companies, /api/v1/users, etc.

// Controllers declare path and version together
@Controller({ path: 'companies', version: '1' })
export class CompanyController {
  @Get()
  async findAll(@Query() options: PageOptionsDto) {
    return this.companyService.findAll(options);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.findOne(id);
  }
}
```

Use `@Version('2')` on a controller or handler when introducing a new version; keep a single default version for the app.

Reference: [NestJS Versioning](https://docs.nestjs.com/techniques/versioning)
