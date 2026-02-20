import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenType } from '../../constants/token-type';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';
import { CustomerService } from '../customer/customer.service';
import { LogedUserDto } from './dtos/loged-user.dto';

type JwtPayload =
  | { userId: number; rolesIds: number[]; type: TokenType.ACCESS_TOKEN; iat: number; exp: number }
  | { customerId: string; type: TokenType.CUSTOMER_ACCESS_TOKEN; iat: number; exp: number };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ApiConfigService,
    private userService: UserService,
    private roleService: RoleService,
    private customerService: CustomerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.publicKey,
    });
  }

  async validate(args: JwtPayload): Promise<LogedUserDto | { userId: number; roles: never[]; customerId: string; isCustomer: true }> {
    if (args.type === TokenType.CUSTOMER_ACCESS_TOKEN && 'customerId' in args) {
      const customer = await this.customerService.findOne(args.customerId);
      if (!customer || customer.isBlacklisted) {
        throw new UnauthorizedException();
      }
      return {
        userId: 0,
        roles: [],
        customerId: customer.uuid,
        isCustomer: true,
      };
    }

    if (args.type !== TokenType.ACCESS_TOKEN || !('userId' in args)) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOneTokenStatus(args.userId);

    if (!user || !user.accessToken) {
      throw new UnauthorizedException();
    }

    const roles = await this.roleService.findByids(args.rolesIds);

    return new LogedUserDto(user.id, user.uuid, roles);
  }
}
