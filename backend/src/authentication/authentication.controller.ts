import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from './authentication.service';
import { AccessTokenDto } from '../dto/accessToken.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Request() req): AccessTokenDto {
    return this.authenticationService.login(req.user);
  }

  @Post('login/google')
  loginWithGoogle(@Body() body): Promise<AccessTokenDto> {
    return this.authenticationService.loginWithGoogle(body);
  }
}
