import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';

import { Auth, AuthUser, PublicRoute } from '../../decorators';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LogedUserDto } from './dtos/loged-user.dto';
import { LoginPayloadDto } from './dtos/login-payload.dto';
import { CustomerLoginPayloadDto } from './dtos/customer-login-payload.dto';
import { CustomerLoginDto } from './dtos/customer-login.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRegisterDto } from './dtos/user-register.dto';

import type { Request } from 'express';

import type { UserDto } from '../user/dtos/user.dto';
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  @PublicRoute()
  async customerLogin(
    @Body() dto: CustomerLoginDto,
  ): Promise<{ data: CustomerLoginPayloadDto }> {
    const customer = await this.authService.validateCustomer({
      loginType: dto.loginType,
      nik: dto.nik,
      pin: dto.pin,
      email: dto.email,
      password: dto.password,
    });
    const token = await this.authService.createCustomerAccessToken(customer);
    return { data: new CustomerLoginPayloadDto(customer, token) };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @PublicRoute()
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
    @Req() req: Request,
  ): Promise<{ data: LoginPayloadDto }> {
    const ipAddress = this.extractClientIp(req);
    
    const user = await this.authService.validateUser(userLoginDto, ipAddress);

    const token = await this.authService.createAccessToken(user);

    return { data: new LoginPayloadDto(user, token) };
  }

  @PublicRoute()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
    @Req() req: Request,
  ): Promise<{ data: LoginPayloadDto }> {
    const registeredUser = await this.userService.registerUser(userRegisterDto);

    const ipAddress = this.extractClientIp(req);

    if (ipAddress) {
      await this.authService.registerDeviceForUser(registeredUser.uuid, ipAddress);
    }

    const token = await this.authService.createAccessToken(registeredUser);

    return { data: new LoginPayloadDto(registeredUser, token) };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async getCurrentUser(
    @AuthUser() user: LogedUserDto,
  ): Promise<{ data: UserDto }> {
    const me = await this.userService.findOne({ id: user.userId });

    return { data: me };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Auth()
  async logout(@AuthUser() user: LogedUserDto): Promise<{ data: boolean }> {
    await this.userService.logout(user.userId);

    return { data: true };
  }

  @Post('forgot-password')
  @PublicRoute()
  async forgotPassword(
    @Body() options: { email: string },
  ): Promise<{ data: string }> {
    const fp = await this.authService.forgotPassword(options);

    return { data: fp };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @PublicRoute()
  async resetPassword(
    @Body() options: { token: string; newPassword: string },
  ): Promise<{ data: boolean }> {
    await this.authService.resetPassword(options);

    return { data: true };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @PublicRoute()
  async verifyEmail(
    @Body() { token }: { token: string },
  ): Promise<{ data: boolean }> {
    await this.userService.validateEmail(token);

    return { data: true };
  }

  private extractClientIp(req: Request): string | undefined {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      undefined;

    return this.normalizeIpAddress(rawIp);
  }

  private normalizeIpAddress(ip?: string): string | undefined {
    if (!ip) {
      return undefined;
    }

    let normalizedIp = ip;

    if (ip.startsWith('[') && ip.endsWith(']')) {
      normalizedIp = ip.slice(1, -1);
    }

    if (normalizedIp === '::1' || normalizedIp === '::') {
      return undefined;
    }

    if (normalizedIp.startsWith('::ffff:')) {
      normalizedIp = normalizedIp.substring(7);
    }

    if (
      normalizedIp === '127.0.0.1' ||
      normalizedIp === 'localhost' ||
      normalizedIp.startsWith('127.')
    ) {
      return undefined;
    }

    return normalizedIp;
  }
}
