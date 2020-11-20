import { Logger, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from '../dto/user.dto';
import { SecurityService } from '../security/security.service';
import { NewUserDto } from '../dto/newUser.dto';
import { plainToClass } from 'class-transformer';
import { MailService } from '../mail/mail.service';
import { FileService } from '../file/file.service';
import { File } from '../file/file.interface';
import { NewAdminDto } from '../dto/newAdmin.dto';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private securityService: SecurityService,
    private mailService: MailService,
    private fileService: FileService,
    private authenticationService: AuthenticationService,
  ) {}

  async getAllUser(dto: boolean): Promise<User[] | UserDto[]> {
    const users = await this.userModel.find({ active: true }).exec();

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
      .findOne({ email: newUserDto.email, active: true })
      .exec();
    if (result) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const { password, ...remainder } = newUserDto;

    const user = {
      ...remainder,
      active: true,
      passwordHash: this.securityService.createHash(password),
      roles: ['user'],
      setNewPasswordDetails: null,
    } as User;

    const createdUser = new this.userModel(user);
    const savedUser = await createdUser.save();

    this.prepareSendingDoubleOptInEmail(savedUser);

    savedUser['accessToken'] = this.authenticationService.login(
      savedUser,
    ).accessToken;

    if (dto) {
      return plainToClass(UserDto, savedUser);
    } else {
      return savedUser.toObject();
    }
  }

  async addAdmin(
    newAdminDto: NewAdminDto,
    dto: boolean,
  ): Promise<User | UserDto> {
    const result = await this.userModel
      .findOne({ email: newAdminDto.email, active: true })
      .exec();
    if (result) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const { password, adminSecret, ...remainder } = newAdminDto;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new HttpException('Invalid admin secret', HttpStatus.FORBIDDEN);
    }

    const admin = {
      ...remainder,
      active: true,
      passwordHash: this.securityService.createHash(password),
      roles: ['admin', 'user'],
      setNewPasswordDetails: null,
    } as User;

    const createdAdmin = new this.userModel(admin);
    const savedAdmin = await createdAdmin.save();

    this.prepareSendingDoubleOptInEmail(savedAdmin);

    savedAdmin['accessToken'] = this.authenticationService.login(
      savedAdmin,
    ).accessToken;

    if (dto) {
      return plainToClass(UserDto, savedAdmin);
    } else {
      return savedAdmin.toObject();
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
    const result = await this.userModel.findOne({ email, active: true }).exec();
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
    const result = await this.userModel
      .findOne({ _id: id, active: true })
      .exec();
    if (!result) {
      return null;
    }
    if (dto) {
      return plainToClass(UserDto, result);
    } else {
      return result.toObject();
    }
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await this.userModel
      .findByIdAndUpdate(id, { active: false })
      .exec();
    if (result) {
      return true;
    }
    return false;
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

  async getProfileImage(id: string): Promise<string | null> {
    const profileImagePath = 'user/profile_images';
    return this.fileService.getFile(profileImagePath, id);
  }

  async resetPassword(email: string): Promise<string> {
    const user = await this.userModel.findOne({ email, active: true }).exec();

    if (!user) {
      return 'No user found with email ' + email;
    }

    this.prepareSendingSetNewPasswordEmail(user);

    return 'Sent email with instructions to set new password';
  }

  private async prepareSendingSetNewPasswordEmail(
    savedUser: User,
  ): Promise<void> {
    const randomToken = this.securityService.createRandomToken(32);

    const setNewPasswordLink = `${process.env.FRONTEND_PROTOCOL}://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/setnewpassword?userId=${savedUser._id}&token=${randomToken}`;

    const success = await this.mailService.sendSetNewPasswordMail(
      savedUser.email,
      setNewPasswordLink,
    );

    if (success) {
      savedUser.setNewPasswordDetails = {
        setNewPasswordToken: randomToken,
        setNewPasswordInProgress: true,
        setNewPasswordSentTimestamp: new Date().toISOString(),
        setNewPasswordConfirmedTimestamp: null,
      };
      savedUser.save();
    }
  }

  async setNewPassword(
    userId: string,
    token: string,
    newPassword: string,
  ): Promise<string> {
    const result = await this.userModel.findById(userId).exec();
    if (!result) {
      return 'Invalid user id';
    }
    if (
      !result.setNewPasswordDetails ||
      !result.setNewPasswordDetails.setNewPasswordInProgress
    ) {
      return 'No password reset issued';
    }
    if (
      result.setNewPasswordDetails &&
      result.setNewPasswordDetails.setNewPasswordToken !== token
    ) {
      return 'Invalid token';
    }

    const hashedNewPassword = this.securityService.createHash(newPassword);

    const updateResult = await this.userModel.findByIdAndUpdate(
      userId,
      {
        'setNewPasswordDetails.setNewPasswordConfirmedTimestamp': new Date().toISOString(),
        'setNewPasswordDetails.setNewPasswordInProgress': false,
        passwordHash: hashedNewPassword,
      },
      {
        new: true,
      },
    );

    if (
      updateResult.setNewPasswordDetails.setNewPasswordConfirmedTimestamp !==
      null
    ) {
      this.logger.log(`Successfully set new password for userId '${userId}'`);
      return 'Successfully set new password';
    } else {
      this.logger.log(`Failed setting new password for userId '${userId}'`);
      return 'Failed setting new password';
    }
  }
}
