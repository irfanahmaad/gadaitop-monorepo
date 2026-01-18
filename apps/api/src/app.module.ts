import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { BorrowRequestModule } from './modules/borrow-request/borrow-request.module';
import { BranchModule } from './modules/branch/branch.module';
import { CompanyModule } from './modules/company/company.module';
import { DeviceModule } from './modules/device/device.module';
import { HealthCheckerModule } from './modules/health-checker/health.module';
import { ItemTypeModule } from './modules/item-type/item-type.module';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SharedModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService],
      dataSourceFactory: (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return Promise.resolve(new DataSource(options));
      },
    }),
    AuthModule,
    UserModule,
    RoleModule,
    CompanyModule,
    BranchModule,
    ItemTypeModule,
    DeviceModule,
    AuditModule,
    BorrowRequestModule,
    HealthCheckerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
