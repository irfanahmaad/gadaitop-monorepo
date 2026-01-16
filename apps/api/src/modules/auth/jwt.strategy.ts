import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenType } from '../../constants/token-type';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';
import { LogedUserDto } from './dtos/loged-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ApiConfigService,
    private userService: UserService,
    private roleService: RoleService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.publicKey,
    });
  }

  async validate(args: {
    userId: number;
    rolesIds: number[];
    type: TokenType;
    iat: number;
    exp: number;
  }): Promise<LogedUserDto> {
    if (args.type !== TokenType.ACCESS_TOKEN) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({
      id: args.userId,
    });

    if (!user.accessToken) {
      throw new UnauthorizedException();
    }

    const roles = await this.roleService.findByids(args.rolesIds);

    return new LogedUserDto(user.id, roles);
  }
}
