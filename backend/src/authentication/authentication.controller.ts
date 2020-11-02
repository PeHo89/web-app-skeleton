import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Request() req): { access_token: string } {
    return this.authenticationService.login(req.user);
  }
}
