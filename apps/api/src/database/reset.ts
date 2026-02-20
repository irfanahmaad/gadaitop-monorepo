import 'reflect-metadata';

import { dataSource } from '../../ormconfig';

/**
 * Reset database by dropping all tables and enum types in the public schema.
 * This avoids "must be owner of schema public" on managed Postgres (RDS, Supabase, etc.)
 * where the app user is not the schema owner.
 */
async function resetDatabase() {
  try {
    await dataSource.initialize();
    console.log('🔄 Resetting database...');

    const q = dataSource.createQueryRunner();

    // Drop all tables in public (CASCADE removes FKs and dependent views)
    const tablesResult = await q.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
    `);
    const tables = (Array.isArray(tablesResult)
      ? tablesResult
      : (tablesResult as { rows?: { tablename: string }[] })?.rows ?? tablesResult?.[0] ?? []) as { tablename: string }[];
    for (const { tablename } of tables) {
      await q.query(`DROP TABLE IF EXISTS "public"."${tablename}" CASCADE`);
    }

    // Drop custom enum types in public (TypeORM migrations create these)
    const enumsResult = await q.query(`
      SELECT t.typname
      FROM pg_type t
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public' AND t.typtype = 'e'
    `);
    const enums = (Array.isArray(enumsResult)
      ? enumsResult
      : (enumsResult as { rows?: { typname: string }[] })?.rows ?? enumsResult?.[0] ?? []) as { typname: string }[];
    for (const { typname } of enums) {
      await q.query(`DROP TYPE IF EXISTS "public"."${typname}" CASCADE`);
    }

    await q.release();
    console.log('✅ Database reset successfully.');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

void resetDatabase();
