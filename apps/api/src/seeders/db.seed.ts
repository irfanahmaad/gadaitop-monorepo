import 'reflect-metadata';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { SeedingSource } from '@concepta/typeorm-seeding';

import { SnakeNamingStrategy } from '../snake-naming.strategy';
import { RoleSeed } from './role/role.seed';
import { UserSeed } from './user/user.seed';

dotenv.config();

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'gadaitop',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
});

export default new SeedingSource({
  dataSource,
  seeders: [RoleSeed, UserSeed],
});
