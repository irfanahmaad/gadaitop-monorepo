---
title: Use DTOs and Serialization for API Responses
impact: MEDIUM
impactDescription: Response DTOs prevent accidental data exposure and ensure consistency
tags: api, dto, serialization, class-transformer
---

## Use DTOs and Serialization for API Responses

Do not expose raw entities without serialization control. Use class-transformer's `@Exclude()` on entity fields that must never be sent to clients (e.g. password hash, internal IDs). Register `ClassSerializerInterceptor` globally. Optionally use a response interceptor to wrap payloads as `{ statusCode, data, meta }`. Prefer returning DTOs or entities that have `@Exclude()` on sensitive columns.

**Incorrect (returning entities directly or manual spreading):**

```typescript
// Return entities directly
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
    // Returns: { id, email, passwordHash, ssn, internalNotes, ... }
    // Exposes sensitive data!
  }
}

// Manual object spreading (error-prone)
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.usersService.findById(id);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    // Easy to forget to exclude sensitive fields
    // Hard to maintain across endpoints
  };
}
```

**Correct (global ClassSerializerInterceptor + @Exclude on entities — align with apps/api):**

```typescript
// main.ts
app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
```

**Entities:** Extend a base entity (e.g. `AbstractEntity`) and use `@Exclude()` on any field that must never appear in API responses:

```typescript
// common/abstract.entity.ts — id, uuid, createdAt, updatedAt, deletedAt, version, createdBy, etc.
@Entity()
export class UserEntity extends AbstractEntity {
  @Column()
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column({ nullable: true })
  @Exclude()
  internalNotes: string;
}
```

Returning the entity from the controller is then safe; sensitive fields are stripped by the global interceptor.

**Optional:** Wrap list/detail responses in a consistent shape with an interceptor:

```typescript
// TransformResponseInterceptor: wrap as { statusCode, data, meta }
// Apply per-controller or per-route where a uniform envelope is required
```

**Explicit response DTOs** when the response shape differs from the entity (e.g. computed fields, different property names):

```typescript
export class UserResponseDto {
  @Expose()
  id: string;
  @Expose()
  email: string;
  @Expose()
  name: string;
  @Expose()
  @Transform(({ obj }) => obj.posts?.length ?? 0)
  postCount: number;
}
// Use plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }) when returning
```

Reference: [NestJS Serialization](https://docs.nestjs.com/techniques/serialization)
