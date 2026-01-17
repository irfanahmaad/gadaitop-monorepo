import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from './entities/role.entity';
import { RoleService } from './role.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  controllers: [],
  exports: [RoleService],
  providers: [RoleService],
})
export class RoleModule {}
