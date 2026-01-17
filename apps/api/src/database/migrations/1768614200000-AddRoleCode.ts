import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRoleCode1768614200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'roles',
      new TableColumn({
        name: 'code',
        type: 'varchar',
        isUnique: true,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('roles', 'code');
  }
}
