import { Inject, Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';
import { UserDto } from '../../../common/dto/user.dto';
import { SecurityService } from '../security/security.service';
import * as mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private securityService: SecurityService,
  ) {}

  getAllUser(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  addUser(userDto: UserDto): Promise<User> {
    const { password, ...remainder } = userDto;

    const user = {
      ...remainder,
      passwordHash: this.securityService.createHash(password),
    };

    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async getUserByEmail(email: string): Promise<User> {
    const result = await this.userModel.findOne({ email }).exec();
    return result.toObject();
  }

  async getUserById(id: string): Promise<User> {
    const result = await this.userModel.findById(id).exec();
    return result.toObject();
  }
}
