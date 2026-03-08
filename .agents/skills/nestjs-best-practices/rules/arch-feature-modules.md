---
title: Organize by Feature Modules
impact: CRITICAL
impactDescription: "3-5x faster onboarding and development"
tags: architecture, modules, organization
---

## Organize by Feature Modules

Organize your application into feature modules that encapsulate related functionality. Each feature module should be self-contained with its own controllers, services, entities, and DTOs. Avoid organizing by technical layer (all controllers together, all services together). This enables 3-5x faster onboarding and feature development.

**Incorrect (technical layer organization):**

```typescript
// Technical layer organization (anti-pattern)
src/
├── controllers/
│   ├── users.controller.ts
│   ├── orders.controller.ts
│   └── products.controller.ts
├── services/
│   ├── users.service.ts
│   ├── orders.service.ts
│   └── products.service.ts
├── entities/
│   ├── user.entity.ts
│   ├── order.entity.ts
│   └── product.entity.ts
└── app.module.ts  // Imports everything directly
```

**Correct (feature module organization):**

```typescript
// Feature module organization — align with apps/api
src/
├── modules/
│   ├── user/
│   │   ├── dto/                    // or dtos/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── company/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── company.controller.ts
│   │   ├── company.service.ts
│   │   └── company.module.ts
│   └── ...
├── common/                         // Shared non-feature code
│   ├── abstract.entity.ts
│   ├── dtos/                       // PageOptionsDto, PageMetaDto
│   ├── filters/
│   └── helpers/
├── shared/
│   ├── shared.module.ts
│   └── services/                   // ApiConfigService, ValidatorService
├── decorators/                     // Auth, AuthUser, CheckPermissions
├── guards/
├── interceptors/
├── database/
│   └── migrations/
└── app.module.ts

// user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    SharedModule,
    TypeOrmModule.forRootAsync({ ... }),
    UserModule,
    CompanyModule,
    // ...
  ],
})
export class AppModule {}
```

- **Controllers:** Use `@Controller({ path: 'resource', version: '1' })` for versioned routes (`/api/v1/resource`).
- **Naming:** Kebab-case files (`company.controller.ts`), PascalCase classes; entities in `entities/` or next to module.
- **DTOs:** Per-module `dto/` or `dtos/` with class-validator; use shared `PageOptionsDto` for list endpoints.

Reference: [NestJS Modules](https://docs.nestjs.com/modules)
