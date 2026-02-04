import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './modules/audit/audit.module';
import { AuctionModule } from './modules/auction/auction.module';
import { AuthModule } from './modules/auth/auth.module';
import { BorrowRequestModule } from './modules/borrow-request/borrow-request.module';
import { BranchModule } from './modules/branch/branch.module';
import { CapitalTopupModule } from './modules/capital-topup/capital-topup.module';
import { CashDepositModule } from './modules/cash-deposit/cash-deposit.module';
import { CashMutationModule } from './modules/cash-mutation/cash-mutation.module';
import { CompanyModule } from './modules/company/company.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CustomerModule } from './modules/customer/customer.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DeviceModule } from './modules/device/device.module';
import { HealthCheckerModule } from './modules/health-checker/health.module';
import { ItemTypeModule } from './modules/item-type/item-type.module';
import { PawnTermModule } from './modules/pawn-term/pawn-term.module';
import { ReportModule } from './modules/report/report.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { RoleModule } from './modules/role/role.module';
import { NkbModule } from './modules/nkb/nkb.module';
import { NotificationModule } from './modules/notification/notification.module';
import { StockOpnameModule } from './modules/stock-opname/stock-opname.module';
import { SpkModule } from './modules/spk/spk.module';
import { UploadModule } from './modules/upload/upload.module';
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
    CustomerModule,
    CatalogModule,
    BranchModule,
    DashboardModule,
    CashDepositModule,
    CapitalTopupModule,
    CashMutationModule,
    ItemTypeModule,
    PawnTermModule,
    SpkModule,
    NkbModule,
    ReportModule,
    SchedulerModule,
    AuctionModule,
    NotificationModule,
    StockOpnameModule,
    UploadModule,
    DeviceModule,
    AuditModule,
    BorrowRequestModule,
    HealthCheckerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
