import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
    BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable,
    NotAcceptableException, NotFoundException, PreconditionFailedException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { validateHash } from '../../common/utils';
import { ActiveStatusEnum } from '../../constants/active-status';
import { TokenType } from '../../constants/token-type';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { DeviceService } from '../device/device.service';
import { RoleService } from '../role/role.service';
import { UserDto } from '../user/dtos/user.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { TokenPayloadDto } from './dtos/token-payload.dto';

import type { UserLoginDto } from './dtos/user-login.dto';

@Injectable()
export class AuthService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 30;

  constructor(
    private jwtService: JwtService,
    private configService: ApiConfigService,
    private userService: UserService,
    private roleService: RoleService,
    private deviceService: DeviceService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createAccessToken(user: UserDto): Promise<TokenPayloadDto> {
    const token = new TokenPayloadDto({
      expiresIn: this.configService.authConfig.jwtExpirationTime,
      accessToken: await this.jwtService.signAsync({
        userId: user.id,
        rolesIds: user.rolesIds || [],
        type: TokenType.ACCESS_TOKEN,
      }),
    });

    await this.userService.update(user.id, { accessToken: token.accessToken });

    return token;
  }

  async validateUser(userLoginDto: UserLoginDto, ipAddress?: string): Promise<UserDto> {
    const user = await this.userService.findOne({
      email: userLoginDto.email,
    });

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - new Date().getTime()) / 60000,
      );
      throw new UnauthorizedException(
        `Akun terkunci. Coba lagi dalam ${minutesLeft} menit`,
      );
    }

    if (user.activeStatus === ActiveStatusEnum.Inactive) {
      throw new NotAcceptableException({
        message: `User with email ${userLoginDto.email} is Inactive. Please contact administrator to Activate user!`,
      });
    }

    if (user.activeStatus === ActiveStatusEnum.Suspended) {
      throw new ForbiddenException({
        message: `User with email ${userLoginDto.email} is Suspended. Please contact administrator.`,
      });
    }

    // Handle device registration/MAC address verification
    if (userLoginDto.macAddress) {
      // Check if user has any registered devices
      const hasRegisteredDevices = await this.deviceService.hasRegisteredDevices(user.uuid);

      if (hasRegisteredDevices) {
        // User has devices registered - verify MAC address
        const isMacValid = await this.deviceService.verifyMacAddress(
          user.uuid,
          userLoginDto.macAddress,
        );

        if (!isMacValid) {
          // MAC not registered - auto-register it for convenience
          // This allows users to login from new devices without manual registration
          await this.deviceService.autoRegisterDevice(
            user.uuid,
            userLoginDto.macAddress,
            ipAddress,
          );
        }
      } else {
        // User has no devices registered - auto-register this device
        // This allows first-time login and bypasses MAC check
        await this.deviceService.autoRegisterDevice(
          user.uuid,
          userLoginDto.macAddress,
          ipAddress,
        );
      }
    } else {
      // No MAC address provided
      const hasRegisteredDevices = await this.deviceService.hasRegisteredDevices(user.uuid);
      
      if (hasRegisteredDevices) {
        // User has devices registered but no MAC provided - require MAC for security
        throw new UnauthorizedException(
          'MAC address diperlukan untuk login. Perangkat Anda belum terdaftar.',
        );
      }
      // If no devices registered and no MAC provided, allow login (bypass)
    }

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new BadRequestException('Email atau password salah');
    }

    // Reset failed attempts on successful login
    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress || null,
    });

    const roles = await this.roleService.findByUser(user.id);

    if (!roles || roles.length === 0) {
      throw new ForbiddenException({
        message: "You don't have permission to access this resource!",
      });
    }

    return new UserDto(user, { rolesIds: roles.map((role) => role.id) });
  }

  private async handleFailedLogin(user: UserEntity): Promise<void> {
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const updateData: Partial<UserEntity> = {
      failedLoginAttempts: failedAttempts,
    };

    // Lock account after MAX_FAILED_ATTEMPTS
    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + this.LOCK_DURATION_MINUTES);
      updateData.lockedUntil = lockUntil;
    }

    await this.userRepository.update(user.id, updateData);
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const user = await this.userService.findOne({ email });

      const token = uuidv4();
      const expires = new Date();
      expires.setHours(expires.getHours() + 3);

      await this.userService.update(user.id, {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      });

      return token;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateResetToken(token: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) {
      throw new NotFoundException({
        message:
          'The link already expired! Please back to forgot password page.',
      });
    }

    if (!user.resetPasswordExpires) {
      throw new NotFoundException({
        message:
          'The link already expired! Please back to forgot password page.',
      });
    } else {
      if (user.resetPasswordExpires < new Date()) {
        throw new PreconditionFailedException({
          message: `Token already expired at: ${user.resetPasswordExpires}`,
        });
      }
    }

    return user;
  }

  async resetPassword(options: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    const user = await this.validateResetToken(options.token);

    await this.userService.update(user.id, {
      password: options.newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async forgotPassword(options: { email: string }): Promise<string> {
    const user = await this.userService.findOne({ email: options.email });

    if (user.resetPasswordExpires && user.resetPasswordExpires > new Date()) {
      throw new BadRequestException(
        'Reset token already sent. Please try again later.',
      );
    }

    const token = await this.generatePasswordResetToken(options.email);
    // await this.mailService.sendPasswordResetCode(options.email, token);

    return 'Reset token sent to your email!';
  }
}
