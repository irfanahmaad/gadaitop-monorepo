import { UserDto } from '../../user/dtos/user.dto';
import { TokenPayloadDto } from './token-payload.dto';

export class LoginPayloadDto {
  user: UserDto;

  token: TokenPayloadDto;

  constructor(user: UserDto, token: TokenPayloadDto) {
    this.user = user;
    this.token = token;
  }
}
