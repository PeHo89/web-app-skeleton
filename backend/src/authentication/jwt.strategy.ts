import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as Constants from '../common/constants';
import { AccessTokenPayloadDto } from '../dto/accessTokenPayload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Constants.JWT_CONSTANTS.secret,
    });
  }

  async validate(payload: any): Promise<AccessTokenPayloadDto> {
    return { sub: payload.sub, username: payload.username };
  }
}
