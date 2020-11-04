import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from './authentication.service';
import { AccessTokenDto } from '../../../common/dto/accessToken.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Request() req): AccessTokenDto {
    return this.authenticationService.login(req.user);
  }
}
