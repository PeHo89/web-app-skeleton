import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { SecurityService } from '../security/security.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from '../../../common/dto/accessToken.dto';
import { AccessTokenPayloadDto } from '../../../common/dto/accessTokenPayload.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private securityService: SecurityService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.getUserByEmail(username);

    if (user && this.securityService.verifyHash(password, user.passwordHash)) {
      return user;
    }
    return null;
  }

  login(user: User): AccessTokenDto {
    const payload = {
      username: user.email,
      sub: user._id,
    } as AccessTokenPayloadDto;
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
