import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { validateHash } from '../../common/utils';
import { TokenType } from '../../constants/token-type';
import { ActiveStatusEnum } from '../../constants/active-status';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { RoleService } from '../role/role.service';
import { UserDto } from '../user/dtos/user.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { TokenPayloadDto } from './dtos/token-payload.dto';
import type { UserLoginDto } from './dtos/user-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ApiConfigService,
    private userService: UserService,
    private roleService: RoleService,
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

  async validateUser(userLoginDto: UserLoginDto): Promise<UserDto> {
    const user = await this.userService.findOne({
      email: userLoginDto.email,
    });

    if (user.activeStatus === ActiveStatusEnum.Inactive) {
      throw new NotAcceptableException({
        message: `User with email ${userLoginDto.email} is Inactive. Please contact administrator to Activate user!`,
      });
    }

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid Password!');
    }

    const roles = await this.roleService.findByUser(user.id);

    if (userLoginDto.isAdmin) {
      if (!user.isAdministrator) {
        throw new ForbiddenException({
          message: "You don't have permission to access this resource!",
        });
      }
      const isSuperAdminRoleExist = roles.find((role) => role.id === 1); // SUPER ADMIN
      if (!isSuperAdminRoleExist) {
        throw new ForbiddenException({
          message: "You don't have permission to access this resource!",
        });
      }
    } else {
      const isUser = roles.find((role) => role.id === 2); // USER

      if (!isUser) {
        throw new ForbiddenException({
          message: "You don't have permission to access this resource!",
        });
      }
    }

    return new UserDto(user, { rolesIds: roles.map((role) => role.id) });
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
