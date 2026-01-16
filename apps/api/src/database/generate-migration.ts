import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { dataSource } from '../../ormconfig';

// Get migration name from args
let migrationName = process.argv[2] || 'NewMigration';
migrationName = migrationName.replace(/^.*\//, '').replace(/\.ts$/, '');
const timestamp = Date.now();

async function generateMigration() {
  try {
    await dataSource.initialize();
    
    // Generate migration using TypeORM's schema builder
    const sqlInMemory = await dataSource.driver.createSchemaBuilder().log();
    
    if (sqlInMemory.upQueries.length === 0) {
      console.log('No changes detected. Database schema is up to date.');
      await dataSource.destroy();
      return;
    }
    
    // Create migration file
    const migrationFileName = `${timestamp}-${migrationName}.ts`;
    const migrationDir = path.join(__dirname, 'migrations');
    const migrationPath = path.join(migrationDir, migrationFileName);
    
    // Ensure migrations directory exists
    if (!fs.existsSync(migrationDir)) {
      fs.mkdirSync(migrationDir, { recursive: true });
    }
    
    // Convert SQL queries to TypeORM migration format
    const upStatements: string[] = [];
    const downStatements: string[] = [];
    
    for (const query of sqlInMemory.upQueries) {
      const escapedQuery = query.query.replace(/`/g, '\\`').replace(/\$/g, '\\$');
      upStatements.push(`    await queryRunner.query(\`${escapedQuery}\`);`);
    }
    
    // Reverse down queries for proper rollback
    for (const query of sqlInMemory.downQueries.reverse()) {
      const escapedQuery = query.query.replace(/`/g, '\\`').replace(/\$/g, '\\$');
      downStatements.push(`    await queryRunner.query(\`${escapedQuery}\`);`);
    }
    
    // Generate class name from migration name
    const className = migrationName
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    const migrationContent = `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${className}${timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
${upStatements.join('\n')}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
${downStatements.join('\n')}
  }
}
`;
    
    fs.writeFileSync(migrationPath, migrationContent);
    console.log(`✅ Migration generated: ${migrationFileName}`);
    console.log(`📁 Path: ${migrationPath}`);
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating migration:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

generateMigration();
