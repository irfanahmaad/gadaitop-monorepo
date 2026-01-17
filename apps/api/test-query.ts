import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from './src/snake-naming.strategy';
import { UserEntity } from './src/modules/user/entities/user.entity';
import { RoleEntity } from './src/modules/role/entities/role.entity';

require('dotenv').config();

async function test() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [UserEntity, RoleEntity],
    synchronize: false,
    logging: true,
  });

  await dataSource.initialize();
  
  try {
    const userRepo = dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { email: 'admin@gadaitop.com' },
      relations: { roles: true },
    });
    
    console.log('User found:', user);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

test();
