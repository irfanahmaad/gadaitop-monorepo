import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Auth } from '../../decorators';
import { DeviceService } from './device.service';
import { DeviceRegistrationDto } from './dto/device-registration.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller({ path: 'users/:userId/devices', version: '1' })
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @Auth([])
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<DeviceRegistrationDto[]> {
    return this.deviceService.findByUser(userId);
  }

  @Post()
  @Auth([])
  async register(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() registerDto: RegisterDeviceDto,
    // TODO: Get registeredBy from auth user
  ): Promise<DeviceRegistrationDto> {
    registerDto.userId = userId;
    // TODO: Get registeredBy from auth user
    return this.deviceService.register(registerDto, '');
  }

  @Patch(':deviceId')
  @Auth([])
  async update(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Body() updateDto: UpdateDeviceDto,
  ): Promise<DeviceRegistrationDto> {
    return this.deviceService.update(deviceId, updateDto);
  }

  @Delete(':deviceId')
  @Auth([])
  async remove(@Param('deviceId', ParseUUIDPipe) deviceId: string): Promise<void> {
    return this.deviceService.remove(deviceId);
  }
}
