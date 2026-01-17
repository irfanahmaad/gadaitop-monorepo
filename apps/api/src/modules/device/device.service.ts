import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DeviceRegistrationEntity } from './entities/device-registration.entity';
import { DeviceRegistrationDto } from './dto/device-registration.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceRegistrationEntity)
    private deviceRepository: Repository<DeviceRegistrationEntity>,
  ) {}

  async findByUser(userId: string): Promise<DeviceRegistrationDto[]> {
    const devices = await this.deviceRepository.find({
      where: { userId },
      order: { lastUsedAt: 'DESC', createdAt: 'DESC' },
    });

    return devices.map((device) => new DeviceRegistrationDto(device));
  }

  async register(registerDto: RegisterDeviceDto, registeredBy: string): Promise<DeviceRegistrationDto> {
    // Check if device already registered for this user
    const existing = await this.deviceRepository.findOne({
      where: {
        userId: registerDto.userId,
        macAddress: registerDto.macAddress,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Device with this MAC address is already registered for this user',
      );
    }

    const device = this.deviceRepository.create({
      ...registerDto,
      registeredBy,
      isActive: true,
    });

    const saved = await this.deviceRepository.save(device);
    return new DeviceRegistrationDto(saved);
  }

  async update(uuid: string, updateDto: UpdateDeviceDto): Promise<DeviceRegistrationDto> {
    const device = await this.deviceRepository.findOne({
      where: { uuid },
    });

    if (!device) {
      throw new NotFoundException(`Device with UUID ${uuid} not found`);
    }

    Object.assign(device, updateDto);
    const updated = await this.deviceRepository.save(device);

    return new DeviceRegistrationDto(updated);
  }

  async remove(uuid: string): Promise<void> {
    const device = await this.deviceRepository.findOne({
      where: { uuid },
    });

    if (!device) {
      throw new NotFoundException(`Device with UUID ${uuid} not found`);
    }

    await this.deviceRepository.softDelete({ uuid });
  }

  async verifyMacAddress(userId: string, macAddress: string): Promise<boolean> {
    const device = await this.deviceRepository.findOne({
      where: {
        userId,
        macAddress,
        isActive: true,
      },
    });

    if (device) {
      // Update last used timestamp
      device.lastUsedAt = new Date();
      await this.deviceRepository.save(device);
      return true;
    }

    return false;
  }

  /**
   * Check if user has any registered devices
   */
  async hasRegisteredDevices(userId: string): Promise<boolean> {
    const count = await this.deviceRepository.count({
      where: {
        userId,
        isActive: true,
      },
    });

    return count > 0;
  }

  /**
   * Auto-register device during login
   * This is called when:
   * 1. User has no devices registered (first login)
   * 2. User has devices but this MAC is not registered (new device)
   */
  async autoRegisterDevice(
    userId: string,
    macAddress: string,
    ipAddress?: string,
  ): Promise<DeviceRegistrationDto> {
    // Check if device already exists (might be inactive)
    const existing = await this.deviceRepository.findOne({
      where: {
        userId,
        macAddress,
      },
    });

    if (existing) {
      // Reactivate and update
      existing.isActive = true;
      existing.lastUsedAt = new Date();
      existing.lastIpAddress = ipAddress || null;
      if (!existing.registeredBy) {
        existing.registeredBy = userId; // Self-registered
      }
      const updated = await this.deviceRepository.save(existing);
      return new DeviceRegistrationDto(updated);
    }

    // Create new device registration
    const device = this.deviceRepository.create({
      userId,
      macAddress,
      deviceName: `Device ${macAddress.slice(-5)}`, // Use last 5 chars of MAC as identifier
      deviceType: null, // Will be updated later if needed
      osInfo: null, // Will be updated later if needed
      isActive: true,
      registeredBy: userId, // Self-registered during login
      registeredAt: new Date(),
      lastUsedAt: new Date(),
      lastIpAddress: ipAddress || null,
    });

    const saved = await this.deviceRepository.save(device);
    return new DeviceRegistrationDto(saved);
  }
}
