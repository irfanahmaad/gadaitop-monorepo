import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

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
    @Req() req: Request,
  ): Promise<DeviceRegistrationDto> {
    const user = (req as any).user;
    const registeredBy = user?.uuid ?? '';
    registerDto.userId = userId;
    return this.deviceService.register(registerDto, registeredBy);
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
