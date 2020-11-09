import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { forwardRef, Module } from '@nestjs/common';
import { User, UserSchema } from './user.schema';
import { SecurityModule } from '../security/security.module';
import { MailModule } from '../mail/mail.module';
import { FileModule } from '../file/file.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SecurityModule,
    MailModule,
    FileModule,
    AuthenticationModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
