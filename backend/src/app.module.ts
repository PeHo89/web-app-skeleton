import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_HOST || 'localhost'}:${
        process.env.MONGO_PORT || 27017
      }/${process.env.MONGO_DATABASE || 'app'}`,
      {
        useFindAndModify: false,
      },
    ),
    UserModule,
    AuthenticationModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
