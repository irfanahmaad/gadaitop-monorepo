---
title: Use Guards for Authentication and Authorization
impact: HIGH
impactDescription: Enforces access control before handlers execute
tags: security, guards, authentication, authorization
---

## Use Guards for Authentication and Authorization

Use guards for authentication and authorization so controllers stay free of access logic. Prefer a single composite decorator (e.g. `@Auth()`) that applies an auth guard (JWT + optional public route), a permission guard (e.g. CASL with action/subject), and an interceptor that sets the current user in request-scoped context. Public routes opt out via `@Auth([], { public: true })`.

**Incorrect (manual auth checks in every handler):**

```typescript
// Manual auth checks in every handler
@Controller('admin')
export class AdminController {
  @Get('users')
  async getUsers(@Request() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    if (!req.user.roles.includes('admin')) {
      throw new ForbiddenException();
    }
    return this.adminService.getUsers();
  }

  @Delete('users/:id')
  async deleteUser(@Request() req, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    if (!req.user.roles.includes('admin')) {
      throw new ForbiddenException();
    }
    return this.adminService.deleteUser(id);
  }
}
```

**Correct (single @Auth decorator with permissions + public opt-out — align with apps/api):**

```typescript
// decorators/http.decorator.ts
export function Auth(
  permissions: IAbility[] = [],
  options?: { public?: boolean },
): MethodDecorator {
  const isPublic = options?.public ?? false;
  return applyDecorators(
    UseGuards(AuthGuard({ public: isPublic }), PermissionsGuard),
    CheckPermissions(...permissions),  // CASL: action + subject
    UseInterceptors(AuthUserInterceptor),
    PublicRoute(isPublic),
  );
}

// Controller: no manual auth checks
@Controller({ path: 'companies', version: '1' })
export class CompanyController {
  @Get()
  @Auth([{ action: AclAction.READ, subject: AclSubject.PT }])
  async findAll(@Query() options: PageOptionsDto) {
    return this.companyService.findAll(options);
  }

  @Get(':id')
  @Auth([{ action: AclAction.READ, subject: AclSubject.PT }])
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyService.findOne(id);
  }
}

// Public route
@Get('health')
@Auth([], { public: true })
health() {
  return { status: 'ok' };
}
```

- **AuthGuard:** Wraps Passport JWT strategy; when `public: true`, allows unauthenticated access.
- **PermissionsGuard:** Reads `CheckPermissions` metadata, builds CASL ability from user roles, throws `ForbiddenException` if not allowed.
- **AuthUserInterceptor:** Puts `request.user` into request-scoped context (e.g. CLS) for use in services.

Reference: [NestJS Guards](https://docs.nestjs.com/guards)
