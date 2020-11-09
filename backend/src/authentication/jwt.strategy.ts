import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as Constants from '../common/constants';
import { AccessTokenPayloadDto } from '../dto/accessTokenPayload.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Constants.JWT_CONSTANTS.secret,
    });
  }

  async validate(payload: any): Promise<AccessTokenPayloadDto | null> {
    const user = await this.userService.getUserById(payload.sub, false);
    if (!user) {
      return null;
    }
    return { sub: payload.sub, username: payload.username };
  }
}
