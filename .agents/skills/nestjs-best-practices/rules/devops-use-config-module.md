---
title: Use ConfigModule for Environment Configuration
impact: LOW-MEDIUM
impactDescription: Proper configuration prevents deployment failures
tags: devops, configuration, environment, validation
---

## Use ConfigModule for Environment Configuration

Use `ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })` and a dedicated config service (e.g. `ApiConfigService`) that wraps `ConfigService` and exposes typed getters for app, database, auth, and other concerns. Use `get()`, `getNumber()`, and optional validation so missing required vars throw at startup. Inject the config service where needed (e.g. TypeORM, JWT) instead of reading `process.env` in business code.

**Incorrect (accessing process.env directly):**

```typescript
// Access process.env directly
@Injectable()
export class DatabaseService {
  constructor() {
    // No validation, can fail at runtime
    this.connection = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT), // NaN if missing
      password: process.env.DB_PASSWORD, // undefined if missing
    });
  }
}

// Scattered env access
@Injectable()
export class EmailService {
  sendEmail() {
    // Different services access env differently
    const apiKey = process.env.SENDGRID_API_KEY || 'default';
    // Typos go unnoticed: process.env.SENDGRID_API_KY
  }
}
```

**Correct (ConfigModule + dedicated config service — align with apps/api):**

```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
}),

// shared/services/api-config.service.ts — single place for env access
@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get(key: string): string { /* required, throws if missing */ }
  getNumber(key: string): number { /* parse and return */ }
  get nodeEnv(): string { return this.getString('NODE_ENV'); }
  get isDevelopment(): boolean { return this.nodeEnv === 'development'; }
  get isProduction(): boolean { return this.nodeEnv === 'production'; }

  get postgresConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getString('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      database: this.getString('DB_DATABASE'),
      synchronize: false,
      entities: ['...'],
      migrations: ['...'],
      namingStrategy: new SnakeNamingStrategy(),
      subscribers: [AuditSubscriber],
    };
  }

  get authConfig() { /* JWT keys, expiration */ }
}
```

**TypeORM and JWT:** Inject `ApiConfigService` and use `postgresConfig` / `authConfig` in `forRootAsync` and JWT module so all env reads go through one service.

Reference: [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
