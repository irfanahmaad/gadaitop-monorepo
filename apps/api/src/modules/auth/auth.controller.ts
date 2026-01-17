import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { Auth, AuthUser, PublicRoute } from '../../decorators';
import type { UserDto } from '../user/dtos/user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LogedUserDto } from './dtos/loged-user.dto';
import { LoginPayloadDto } from './dtos/login-payload.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRegisterDto } from './dtos/user-register.dto';

@Controller({ path: 'auth' })
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @PublicRoute()
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
    // @Req() req: Request, // TODO: Get IP from request
  ): Promise<{ data: LoginPayloadDto }> {
    // TODO: Extract IP from request: req.ip or req.headers['x-forwarded-for']
    const ipAddress = undefined;
    const user = await this.authService.validateUser(userLoginDto, ipAddress);

    const token = await this.authService.createAccessToken(user);

    return { data: new LoginPayloadDto(user, token) };
  }

  @PublicRoute()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async userRegister(
    @Body() userRegisterDto: UserRegisterDto,
  ): Promise<{ data: LoginPayloadDto }> {
    const registeredUser = await this.userService.registerUser(userRegisterDto);

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
}
