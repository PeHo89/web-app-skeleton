import { Logger, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PersonalSettings,
  PersonalInformation,
  UserDto,
} from '../dto/user.dto';
import { SecurityService } from '../security/security.service';
import { NewUserDto } from '../dto/newUser.dto';
import { plainToClass } from 'class-transformer';
import { MailService } from '../mail/mail.service';
import { FileService } from '../file/file.service';
import { File } from '../file/file.interface';
import { NewAdminDto } from '../dto/newAdmin.dto';
import { AuthenticationService } from '../authentication/authentication.service';
import { UpdateEmailDto } from '../dto/updateEmail.dto';
import { UpdatePasswordDto } from '../dto/updatePassword.dto';

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
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Email already exists',
        },
        HttpStatus.CONFLICT,
      );
    }

    const { password, ...remainder } = newUserDto;

    const user = {
      ...remainder,
      active: true,
      passwordHash: this.securityService.createHash(password),
      roles: ['user'],
      setNewPasswordDetails: null,
      personalInformation: null,
      personalSettings: null,
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
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Email already exists',
        },
        HttpStatus.CONFLICT,
      );
    }

    const { password, adminSecret, ...remainder } = newAdminDto;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Invalid admin secret',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const admin = {
      ...remainder,
      active: true,
      passwordHash: this.securityService.createHash(password),
      roles: ['admin', 'user'],
      setNewPasswordDetails: null,
      personalInformation: null,
      personalSettings: null,
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

    const doubleOptInConfirmationLink = `${process.env.FRONTEND_PROTOCOL}://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/confirmemail?userId=${savedUser._id}&token=${randomToken}&email=${savedUser.email}`;

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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid user id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      result.doubleOptInDetails &&
      result.doubleOptInDetails.doubleOptInConfirmedTimestamp !== null
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email already confirmed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      result.doubleOptInDetails &&
      result.doubleOptInDetails.doubleOptInToken !== token
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid token',
        },
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed confirming email',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addProfileImage(id: string, image: File): Promise<string> {
    const profileImagePath = 'user/profile_images';

    const filename = `${id}.${
      image.originalname.split('.')[image.originalname.split('.').length - 1]
    }`;

    this.fileService.deleteFile(profileImagePath, id);
    this.fileService.addFile(profileImagePath, filename, image.buffer);

    return 'Successfully uploaded profile image';
  }

  async getProfileImage(id: string): Promise<string | null> {
    const profileImagePath = 'user/profile_images';
    return this.fileService.getFile(profileImagePath, id);
  }

  async resetPassword(email: string): Promise<string> {
    const user = await this.userModel.findOne({ email, active: true }).exec();

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'No user found with email',
        },
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid user id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !result.setNewPasswordDetails ||
      !result.setNewPasswordDetails.setNewPasswordInProgress
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'No password reset issued',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      result.setNewPasswordDetails &&
      result.setNewPasswordDetails.setNewPasswordToken !== token
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid token',
        },
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed setting new password',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async updateEmail(
    userId: string,
    updateEmailDto: UpdateEmailDto,
  ): Promise<string> {
    const result = await this.userModel.findById(userId).exec();
    if (!result) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid user id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (result.email !== updateEmailDto.oldEmail) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "Email doesn't match",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const newEmailCheck = await this.userModel
      .findOne({ email: updateEmailDto.newEmail, active: true })
      .exec();
    if (newEmailCheck) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'Email already exists',
        },
        HttpStatus.CONFLICT,
      );
    }
    result.email = updateEmailDto.newEmail;

    const updateResult = await result.save();

    this.prepareSendingDoubleOptInEmail(updateResult);

    if (updateResult !== null) {
      this.logger.log(`Successfully updated email for userId '${userId}'`);
      return 'Successfully updated email';
    } else {
      this.logger.log(`Failed updating email for userId '${userId}'`);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed updating email',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<string> {
    const result = await this.userModel.findById(userId).exec();
    if (!result) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid user id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      result.passwordHash !==
      this.securityService.createHash(updatePasswordDto.oldPassword)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "Password doesn't match",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    result.passwordHash = this.securityService.createHash(
      updatePasswordDto.newPassword,
    );

    const updateResult = await result.save();

    if (updateResult !== null) {
      this.logger.log(`Successfully updated password for userId '${userId}'`);
      return 'Successfully updated password';
    } else {
      this.logger.log(`Failed updating password for userId '${userId}'`);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed updating password',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async updatePersonalInformation(
    userId: string,
    personalInformation: PersonalInformation,
  ): Promise<string> {
    const result = await this.userModel.findById(userId).exec();
    if (!result) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid user id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    result.personalInformation = personalInformation;

    const updateResult = await result.save();

    if (updateResult !== null) {
      this.logger.log(
        `Successfully updated personal information for userId '${userId}'`,
      );
      return 'Successfully updated personal information';
    } else {
      this.logger.log(
        `Failed updating personal information for userId '${userId}'`,
      );
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed updating personal information',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async updatePersonalSettings(
    userId: string,
    personalSettings: PersonalSettings,
  ): Promise<string> {
    const result = await this.userModel.findById(userId).exec();
    if (!result) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid user id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    result.personalSettings = personalSettings;

    const updateResult = await result.save();

    if (updateResult !== null) {
      this.logger.log(
        `Successfully updated personal settings for userId '${userId}'`,
      );
      return 'Successfully updated personal settings';
    } else {
      this.logger.log(
        `Failed updating personal settings for userId '${userId}'`,
      );
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed updating personal settings',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
