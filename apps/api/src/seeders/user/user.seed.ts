import { Seeder } from '@concepta/typeorm-seeding';

import { ActiveStatusEnum } from '../../constants/active-status';
import { RoleEntity } from '../../modules/role/entities/role.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { dataSource } from '../db.seed';
import { UserFactory } from './user.factory';

export class UserSeed extends Seeder {
  async run(): Promise<void> {
    const userFactory = this.factory(UserFactory);

    // Initialize dataSource if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // Check if super admin user already exists
    try {
      const existingUser = await dataSource
        .getRepository(UserEntity)
        .findOne({ where: { email: 'admin@gadaitop.com' } });

      if (existingUser) {
        console.log('Super admin user already exists, skipping seed');
        return;
      }
    } catch (error) {
      // If we can't check, continue with seeding
      console.log('Could not check existing user, proceeding with seed...');
    }

    // Get SUPER_ADMIN role
    try {
      const superAdminRole = await dataSource
        .getRepository(RoleEntity)
        .findOne({ where: { code: 'SUPER_ADMIN' } });

      if (!superAdminRole) {
        throw new Error(
          'SUPER_ADMIN role not found. Please run RoleSeed first.',
        );
      }

      // Create super admin user
      const superAdminUser = await userFactory.create({
        email: 'admin@gadaitop.com',
        password: 'admin123',
        name: 'Super Admin',
        isAdministrator: true,
        activeStatus: ActiveStatusEnum.Active,
        isEmailVerified: true,
        isPhoneVerified: false,
        isRegistrationComplete: true,
      });

      // Assign SUPER_ADMIN role to user
      superAdminUser.roles = [superAdminRole];
      await dataSource.getRepository(UserEntity).save(superAdminUser);
    } catch (error) {
      console.error('Error seeding user:', error);
      throw error;
    }

    console.log('✅ Seeded super admin user successfully');
    console.log('   Email: admin@gadaitop.com');
    console.log('   Password: admin123');
  }
}
