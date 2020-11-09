import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { SecurityService } from '../security/security.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from '../dto/accessToken.dto';
import { AccessTokenPayloadDto } from '../dto/accessTokenPayload.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private securityService: SecurityService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const user: User = (await this.userService.getUserByEmail(
      loginDto.username,
      false,
    )) as User | null;

    if (
      user &&
      this.securityService.verifyHash(loginDto.password, user.passwordHash)
    ) {
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

  async userHasRole(id: string, roles: string[]): Promise<boolean> {
    const result = (await this.userService.getUserById(id, false)) as User;
    if (!result || !result.roles) {
      return false;
    }
    for (const role of roles) {
      for (const userRole of result.roles) {
        if (userRole === role) {
          return true;
        }
      }
    }
    return false;
  }
}
