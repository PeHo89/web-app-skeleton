import { Inject, Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';
import { UserDto } from '../dto/user.dto';
import { SecurityService } from '../security/security.service';
import { NewUserDto } from '../dto/newUser.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private securityService: SecurityService,
  ) {}

  async getAllUser(dto: boolean): Promise<User[] | UserDto[]> {
    const users = await this.userModel.find().exec();

    let result;

    if (dto) {
      result = [] as UserDto[];
      for (const user of users) {
        result.push(plainToClass(UserDto, user));
      }
    } else {
      result = [] as User[];
      for (const user of users) {
        result.push(user.toObject());
      }
    }
    return result;
  }

  async addUser(newUserDto: NewUserDto, dto: boolean): Promise<User | UserDto> {
    const { password, ...remainder } = newUserDto;

    const user = {
      ...remainder,
      passwordHash: this.securityService.createHash(password),
    } as User;

    const createdUser = new this.userModel(user);
    const savedUser = await createdUser.save();

    if (dto) {
      return plainToClass(UserDto, savedUser);
    } else {
      return savedUser.toObject();
    }
  }

  async getUserByEmail(
    email: string,
    dto: boolean,
  ): Promise<User | UserDto | null> {
    const result = await this.userModel.findOne({ email }).exec();
    if (!result) {
      return null;
    }
    if (dto) {
      return plainToClass(UserDto, result);
    } else {
      return result.toObject();
    }
  }

  async getUserById(id: string, dto: boolean): Promise<User | UserDto | null> {
    const result = await this.userModel.findById(id).exec();
    if (!result) {
      return null;
    }
    if (dto) {
      return plainToClass(UserDto, result);
    } else {
      return result.toObject();
    }
  }
}
