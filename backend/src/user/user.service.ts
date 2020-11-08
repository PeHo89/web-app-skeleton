import { Logger, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema, Types } from 'mongoose';
import { UserDto } from '../dto/user.dto';
import { SecurityService } from '../security/security.service';
import { NewUserDto } from '../dto/newUser.dto';
import { plainToClass } from 'class-transformer';
import { MailService } from '../mail/mail.service';
import { FileService } from '../file/file.service';
import { File } from '../file/file.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private securityService: SecurityService,
    private mailService: MailService,
    private fileService: FileService,
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
    const result = await this.userModel
      .findOne({ email: newUserDto.email })
      .exec();
    if (result) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const { password, ...remainder } = newUserDto;

    const user = {
      ...remainder,
      passwordHash: this.securityService.createHash(password),
    } as User;

    const createdUser = new this.userModel(user);
    let savedUser = await createdUser.save();

    this.prepareSendingDoubleOptInEmail(savedUser);

    if (dto) {
      return plainToClass(UserDto, savedUser);
    } else {
      return savedUser.toObject();
    }
  }

  private async prepareSendingDoubleOptInEmail(savedUser: User): Promise<void> {
    const randomToken = this.securityService.createRandomToken(32);

    const doubleOptInConfirmationLink = `${process.env.BACKEND_PROTOCOL}://${process.env.BACKEND_HOST}:${process.env.BACKEND_PORT}/user/confirm?userId=${savedUser._id}&token=${randomToken}`;

    const success = await this.mailService.sendDoubleOptInMail(
      savedUser.email,
      doubleOptInConfirmationLink,
    );

    if (success) {
      savedUser.doubleOptInDetails = {
        doubleOptInToken: randomToken,
        doubleOptInSentTimestamp: new Date().toISOString(),
        doubleOptInConfirmedTimestamp: null,
      };
      savedUser.save();
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

  async confirmEmail(userId: string, token: string): Promise<string> {
    const result = await this.userModel.findById(userId).exec();
    if (!result) {
      return 'Invalid user id';
    }
    if (
      result.doubleOptInDetails &&
      result.doubleOptInDetails.doubleOptInConfirmedTimestamp !== null
    ) {
      return 'Email already confirmed';
    }
    if (
      result.doubleOptInDetails &&
      result.doubleOptInDetails.doubleOptInToken !== token
    ) {
      return 'Invalid token';
    }

    const updateResult = await this.userModel.findByIdAndUpdate(
      userId,
      {
        'doubleOptInDetails.doubleOptInConfirmedTimestamp': new Date().toISOString(),
      },
      {
        new: true,
      },
    );

    if (
      updateResult.doubleOptInDetails.doubleOptInConfirmedTimestamp !== null
    ) {
      this.logger.log(`Successfully confirmed email '${updateResult.email}'`);
      return 'Successfully confirmed email';
    } else {
      this.logger.log(`Failed confirming email '${updateResult.email}'`);
      return 'Failed confirming email';
    }
  }

  async addProfileImage(id: string, image: File): Promise<void> {
    const profileImagePath = 'user/profile_images';

    const filename = `${id}.${
      image.originalname.split('.')[image.originalname.split('.').length - 1]
    }`;

    this.fileService.deleteFile(profileImagePath, id);
    this.fileService.addFile(profileImagePath, filename, image.buffer);
  }

  async getProfileImage(id: string): Promise<Buffer | null> {
    const profileImagePath = 'user/profile_images';
    return this.fileService.getFile(profileImagePath, id);
  }
}
