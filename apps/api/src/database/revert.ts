import 'reflect-metadata';
import { dataSource } from '../../ormconfig';

async function revertMigration() {
  try {
    await dataSource.initialize();
    console.log('Reverting last migration...');
    await dataSource.undoLastMigration();
    console.log('✅ Migration reverted successfully');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Revert failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

revertMigration();
