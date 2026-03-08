---
title: Use Interceptors for Cross-Cutting Concerns
impact: MEDIUM-HIGH
impactDescription: Interceptors provide clean separation for cross-cutting logic
tags: api, interceptors, logging, caching
---

## Use Interceptors for Cross-Cutting Concerns

Use interceptors for cross-cutting concerns: serialization, attaching request-scoped user, or wrapping responses. Register `ClassSerializerInterceptor` globally for entity/DTO serialization. Use an auth-user interceptor (e.g. with nestjs-cls) to set the current user for the request so services can access it. Optionally use a response interceptor to wrap payloads as `{ statusCode, data, meta }` where needed.

**Incorrect (logging and transformation in every method):**

```typescript
// Logging in every controller method
@Controller('users')
export class UsersController {
  @Get()
  async findAll(): Promise<User[]> {
    const start = Date.now();
    this.logger.log('findAll called');

    const users = await this.usersService.findAll();

    this.logger.log(`findAll completed in ${Date.now() - start}ms`);
    return users;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const start = Date.now();
    this.logger.log(`findOne called with id: ${id}`);

    const user = await this.usersService.findOne(id);

    this.logger.log(`findOne completed in ${Date.now() - start}ms`);
    return user;
  }
  // Repeated in every method!
}

// Manual response wrapping
@Get()
async findAll(): Promise<{ data: User[]; meta: Meta }> {
  const users = await this.usersService.findAll();
  return {
    data: users,
    meta: { timestamp: new Date(), count: users.length },
  };
}
```

**Correct (global serialization + auth-user + optional response wrapper — align with apps/api):**

```typescript
// main.ts — global serialization
app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
```

**Auth-user interceptor:** Run after auth guard; read `request.user` and store in request-scoped context (e.g. nestjs-cls) so services can get the current user without passing it through every method.

```typescript
// AuthUserInterceptor: set user in CLS from request.user
// Applied via @Auth() decorator together with AuthGuard and PermissionsGuard
```

**Optional response wrapper:** For list/detail endpoints that should return a consistent envelope:

```typescript
// TransformResponseInterceptor: wrap handler result as { statusCode, data, meta }
// Use instanceToPlain for serialization; apply per-controller or per-route
```

Prefer exception filters (e.g. global `QueryFailedErrorFilter`) over interceptors for mapping DB errors to HTTP responses.

Reference: [NestJS Interceptors](https://docs.nestjs.com/interceptors)
