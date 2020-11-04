import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { SecurityService } from '../security/security.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from '../dto/accessToken.dto';
import { AccessTokenPayloadDto } from '../dto/accessTokenPayload.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private securityService: SecurityService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user: User = (await this.userService.getUserByEmail(
      username,
      false,
    )) as User | null;

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
