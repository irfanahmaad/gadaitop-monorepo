import 'reflect-metadata';

import { dataSource } from '../../ormconfig';

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('📊 Database Connection Info:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_DATABASE}`);
    console.log(`   Username: ${process.env.DB_USERNAME}`);
    console.log('');

    // Check pending migrations before running
    const pendingMigrations = await dataSource.showMigrations();
    console.log(`🔄 Pending migrations: ${pendingMigrations ? 'Yes' : 'No'}`);

    if (!pendingMigrations) {
      console.log('ℹ️  No pending migrations to run.');
      await dataSource.destroy();
      process.exit(0);
    }

    console.log('🚀 Running migrations...');
    const executedMigrations = await dataSource.runMigrations();
    
    if (executedMigrations.length > 0) {
      console.log(`\n✅ Successfully executed ${executedMigrations.length} migration(s):`);
      executedMigrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    } else {
      console.log('ℹ️  No migrations were executed.');
    }

    // Verify tables were created
    const queryRunner = dataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    console.log(`\n📊 Total tables in database: ${tables.length}`);
    if (tables.length > 0) {
      console.log('   Tables:');
      tables.forEach((table) => {
        console.log(`     - ${table.name}`);
      });
    }
    await queryRunner.release();

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

runMigrations();
