import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { Module } from '@nestjs/common';
import { User, UserSchema } from './user.schema';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SecurityModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
