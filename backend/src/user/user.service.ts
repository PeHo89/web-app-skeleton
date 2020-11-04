import { Inject, Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';
import { UserDto } from '../../../common/dto/user.dto';
import { SecurityService } from '../security/security.service';
import { NewUserDto } from '../../../common/dto/newUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private securityService: SecurityService,
  ) {}

  getAllUser(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  addUser(newUserDto: NewUserDto): Promise<User> {
    const { password, ...remainder } = newUserDto;

    const user = {
      ...remainder,
      passwordHash: this.securityService.createHash(password),
    } as User;

    const createdUser = new this.userModel(user);
    return createdUser.save();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await this.userModel.findOne({ email }).exec();
    if (result) {
      return result.toObject();
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.userModel.findById(id).exec();
    if (result) {
      return result.toObject();
    }
    return null;
  }
}
