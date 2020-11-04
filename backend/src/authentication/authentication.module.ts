import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserModule } from '../user/user.module';
import { SecurityModule } from '../security/security.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';
import { JwtStrategy } from './jwt.strategy';
import * as Constants from '../common/constants';

@Module({
  imports: [
    UserModule,
    SecurityModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: Constants.JWT_CONSTANTS.secret,
      signOptions: { expiresIn: '15d' },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
