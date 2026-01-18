import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyEntity } from './entities/company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { UserEntity } from '../user/entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity, UserEntity, RoleEntity])],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
