import { Logger, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Subscription, User, UserDocument } from './user.schema';
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
import Stripe from 'stripe';
import { NewSubscriptionDto } from '../dto/newSubscription.dto';
import { SubscriptionDto } from '../dto/subscription.dto';
import { NewSubscriptionSessionDto } from '../dto/newSubscriptionSession.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
  });

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

  async addUser(
    newUserDto: NewUserDto,
    dto: boolean,
    isOAuthUser: boolean = false,
  ): Promise<User | UserDto> {
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

    if (!newUserDto.email) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email can not be empty',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!password && !isOAuthUser) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Password can not be empty',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = {
      ...remainder,
      active: true,
      passwordHash: isOAuthUser
        ? null
        : this.securityService.createHash(password),
      roles: ['user'],
      setNewPasswordDetails: null,
      personalInformation: null,
      personalSettings: null,
      isOAuthUser,
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

    if (!newAdminDto.email) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email can not be empty',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!password) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Password can not be empty',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

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
      isOAuthUser: false,
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

    if (user.isOAuthUser) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'OAuth user can not reset password',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

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

    if (result.isOAuthUser) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'OAuth user can not set new password',
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

    if (result.isOAuthUser) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'OAuth user can not update email',
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

    if (result.isOAuthUser) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'OAuth user can not update password',
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

  public async getAvailableSubscriptions(): Promise<SubscriptionDto[]> {
    const stripePricesAndProducts = (
      await this.stripe.prices.list({ expand: ['data.product'] })
    ).data;

    const subscriptionDtos = stripePricesAndProducts.map(
      (stripePriceAndProduct) =>
        ({
          id: stripePriceAndProduct.id,
          name: (stripePriceAndProduct.product as Stripe.Product).name,
          description: (stripePriceAndProduct.product as Stripe.Product)
            .description,
          amount: stripePriceAndProduct.unit_amount,
          currency: stripePriceAndProduct.currency,
          type: stripePriceAndProduct.type,
          interval: stripePriceAndProduct.recurring.interval,
        } as SubscriptionDto),
    );

    return subscriptionDtos;
  }

  public async newSubscription(
    userId: string,
    newSubscriptionDto: NewSubscriptionDto,
  ): Promise<NewSubscriptionSessionDto> {
    const user = (await this.getUserById(userId, false)) as User;

    if (user.subscription && user.subscription.confirmedTimestamp !== null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User already has confirmed subscription',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: newSubscriptionDto.id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_PROTOCOL}://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_PROTOCOL}://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}/subscription-cancel`,
    });

    await this.userModel.findByIdAndUpdate(
      userId,
      {
        'subscription.sessionId': session.id,
        'subscription.createdTimestamp': new Date().toISOString(),
        'subscription.stripePriceId': newSubscriptionDto.id,
        'subscription.confirmedTimestamp': null,
      },
      {
        new: true,
      },
    );

    return {
      sessionId: session.id,
    } as NewSubscriptionSessionDto;
  }

  public async confirmSubscription(
    userId: string,
    sessionId: string,
  ): Promise<string> {
    const user = (await this.getUserById(userId, false)) as User;

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid user id',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user.subscription && user.subscription.confirmedTimestamp !== null) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Subscription already confirmed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (user.subscription && user.subscription.sessionId !== sessionId) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: "Session ids for subscription doesn't match",
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session && session.subscription && session.subscription !== '') {
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          'subscription.confirmedTimestamp': new Date().toISOString(),
          'subscription.stripeSubscriptionId': session.subscription,
        },
        {
          new: true,
        },
      );

      this.logger.log(
        `Successfully confirmed subscription with id '${session.subscription}' for user with id '${user._id}'`,
      );
      return 'Successfully confirmed subscription';
    } else {
      this.logger.log(
        `Failed confirming subscription for user with id '${user._id}'`,
      );
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed confirming subscription',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
