import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { User } from '../user/user.schema';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authenticationService: AuthenticationService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authenticationService.validateUser({
      username,
      password,
    } as LoginDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
