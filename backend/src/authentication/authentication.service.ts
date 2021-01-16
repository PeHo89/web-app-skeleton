import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.schema';
import { SecurityService } from '../security/security.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from '../dto/accessToken.dto';
import { AccessTokenPayloadDto } from '../dto/accessTokenPayload.dto';
import { LoginDto } from '../dto/login.dto';
import { OAuth2Client } from 'google-auth-library';
import { IdTokenDto } from '../dto/idToken.dto';
import { NewUserDto } from '../dto/newUser.dto';

@Injectable()
export class AuthenticationService {
  private oAuth2Client = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

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

    const accessToken = this.jwtService.sign(payload);
    const expiresAt = (this.jwtService.decode(accessToken) as {
      [key: string]: any;
    }).exp;

    return {
      accessToken,
      expiresAt,
    };
  }

  async loginWithGoogle(idTokenDto: IdTokenDto): Promise<AccessTokenDto> {
    const loginTicket = await this.oAuth2Client.verifyIdToken({
      idToken: idTokenDto.idToken,
      audience: process.env.OAUTH_CLIENT_ID,
    });
    const payload = loginTicket.getPayload();

    let user = (await this.userService.getUserByEmail(
      payload.email,
      false,
    )) as User;

    if (!user) {
      const newUserDto = { email: payload.email } as NewUserDto;

      user = (await this.userService.addUser(newUserDto, false, true)) as User;
    }

    return this.login(user);
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
