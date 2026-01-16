import 'reflect-metadata';
import { dataSource } from '../../ormconfig';

async function checkMigrations() {
  try {
    await dataSource.initialize();
    console.log('📊 Database Connection Info:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_DATABASE}`);
    console.log(`   Username: ${process.env.DB_USERNAME}`);
    console.log('');

    // Check if migrations table exists
    const queryRunner = dataSource.createQueryRunner();
    const migrationsTableExists = await queryRunner.hasTable('migrations');
    console.log(`📋 Migrations table exists: ${migrationsTableExists}`);

    if (migrationsTableExists) {
      const executedMigrations = await queryRunner.query(
        'SELECT * FROM migrations ORDER BY timestamp DESC',
      );
      console.log(`\n✅ Executed migrations (${executedMigrations.length}):`);
      executedMigrations.forEach((migration: any) => {
        console.log(`   - ${migration.name} (timestamp: ${migration.timestamp})`);
      });
    } else {
      console.log('\n⚠️  Migrations table does not exist yet.');
    }

    // Check pending migrations
    const pendingMigrations = await dataSource.showMigrations();
    console.log(`\n🔄 Pending migrations: ${pendingMigrations ? 'Yes' : 'No'}`);

    // List all tables
    const tables = await queryRunner.getTables();
    console.log(`\n📊 Tables in database (${tables.length}):`);
    tables.forEach((table) => {
      console.log(`   - ${table.name}`);
    });

    await queryRunner.release();
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Check failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

checkMigrations();
