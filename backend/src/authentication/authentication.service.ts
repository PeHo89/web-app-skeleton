import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { SecurityService } from '../security/security.service';
import { JwtService } from '@nestjs/jwt';

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
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: User): { access_token: string } {
    const payload = { username: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
