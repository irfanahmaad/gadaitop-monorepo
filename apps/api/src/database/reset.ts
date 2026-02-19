import 'reflect-metadata';

import { dataSource } from '../../ormconfig';

async function resetDatabase() {
  try {
    await dataSource.initialize();
    console.log('🔄 Resetting database...');

    // await dataSource.dropDatabase();
    // Drop the public schema and recreate it to clean all tables, views, etc.
    await dataSource.query('DROP SCHEMA public CASCADE');
    await dataSource.query('CREATE SCHEMA public');
    await dataSource.query('GRANT ALL ON SCHEMA public TO public');
    console.log('✅ Database schema reset successfully.');

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

resetDatabase();
