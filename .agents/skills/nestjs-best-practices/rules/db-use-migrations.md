---
title: Use Database Migrations
impact: HIGH
impactDescription: Enables safe, repeatable database schema changes
tags: database, migrations, typeorm, schema
---

## Use Database Migrations

Never use `synchronize: true` in production. Use migrations for all schema changes. Store migrations in a dedicated directory (e.g. `src/database/migrations/`) with timestamp-prefixed names. Use a naming strategy (e.g. `SnakeNamingStrategy`) consistently. Run migrations via CLI or a script (e.g. `migration:run`, `migration:generate`) and keep `synchronize: false` in TypeORM config.

**Incorrect (using synchronize or manual SQL):**

```typescript
// Use synchronize in production
TypeOrmModule.forRoot({
  type: 'postgres',
  synchronize: true, // DANGEROUS in production!
  // Can drop columns, tables, or data
});

// Manual SQL in production
@Injectable()
export class DatabaseService {
  async addColumn(): Promise<void> {
    await this.dataSource.query('ALTER TABLE users ADD COLUMN age INT');
    // No version control, no rollback, inconsistent across envs
  }
}

// Modify entities without migration
@Entity()
export class User {
  @Column()
  email: string;

  @Column() // Added without migration
  newField: string; // Will crash in production if synchronize is false
}
```

**Correct (migrations dir + SnakeNamingStrategy + synchronize false — align with apps/api):**

```typescript
// TypeORM config via ApiConfigService (or ConfigService)
get postgresConfig(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: this.getString('DB_HOST'),
    port: this.getNumber('DB_PORT'),
    // ...
    synchronize: false,
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}', '...view-entity'],
    migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
    namingStrategy: new SnakeNamingStrategy(),
    subscribers: [AuditSubscriber],
  };
}

// app.module.ts
TypeOrmModule.forRootAsync({
  imports: [SharedModule],
  useFactory: (config: ApiConfigService) => config.postgresConfig,
  inject: [ApiConfigService],
});
```

**Migrations:** In `src/database/migrations/` with timestamp prefix; use CLI/scripts: `migration:run`, `migration:generate`, `migration:revert`, `migration:check`. Implement both `up` and `down`. Use snake_case column/table names to match `SnakeNamingStrategy` and entity property names.

```typescript
// src/database/migrations/1730000000000-AddUserAge.ts
export class AddUserAge1730000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "age" integer DEFAULT 0`);
    await queryRunner.query(`CREATE INDEX "IDX_users_age" ON "users" ("age")`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_age"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "age"`);
  }
}
```

Reference: [TypeORM Migrations](https://typeorm.io/migrations)
