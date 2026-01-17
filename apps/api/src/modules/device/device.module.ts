import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeviceRegistrationEntity } from './entities/device-registration.entity';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceRegistrationEntity])],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
