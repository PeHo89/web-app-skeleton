import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  Request,
  Query,
  UploadedFile,
  Delete,
  Put,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UserDto } from '../dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { NewUserDto } from '../dto/newUser.dto';
import { File } from '../file/file.interface';
import { Roles } from '../authentication/roles.decorator';
import { RolesGuard } from '../authentication/roles.guard';
import { NewAdminDto } from '../dto/newAdmin.dto';
import { EmailDto } from '../dto/email.dto';
import { PasswordDto } from '../dto/password.dto';
import { UpdatePasswordDto } from '../dto/updatePassword.dto';
import { UpdateEmailDto } from '../dto/updateEmail.dto';
import { PersonalInformation, PersonalSettings } from '../dto/user.dto';
import { NewSubscriptionDto } from '../dto/newSubscription.dto';
import { SubscriptionDto } from '../dto/subscription.dto';
import { NewSubscriptionSessionDto } from '../dto/newSubscriptionSession.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getAllUser(): Promise<UserDto[]> {
    return (await this.userService.getAllUser(true)) as UserDto[];
  }

  @Post()
  async addUser(@Body() newUserDto: NewUserDto): Promise<UserDto> {
    return (await this.userService.addUser(newUserDto, true)) as UserDto;
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Request() req: any): Promise<UserDto> {
    return (await this.userService.getUserById(req.user.sub, true)) as UserDto;
  }

  @Delete('profile')
  @UseGuards(AuthGuard('jwt'))
  async deleteUserById(@Request() req: any): Promise<boolean> {
    return this.userService.deleteUserById(req.user.sub);
  }

  @Post('profile/image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('profileImage'))
  async addProfileImage(
    @Request() req: any,
    @UploadedFile() image: File,
  ): Promise<string> {
    return this.userService.addProfileImage(req.user.sub, image);
  }

  @Get('profile/image')
  @UseGuards(AuthGuard('jwt'))
  async getProfileImage(@Request() req: any): Promise<string> {
    return this.userService.getProfileImage(req.user.sub);
  }

  @Put('profile/email')
  @UseGuards(AuthGuard('jwt'))
  async updateEmail(
    @Request() req: any,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<string> {
    return this.userService.updateEmail(req.user.sub, updateEmailDto);
  }

  @Put('profile/personalinformation')
  @UseGuards(AuthGuard('jwt'))
  async updatePersonalInformation(
    @Request() req: any,
    @Body() personalInformation: PersonalInformation,
  ): Promise<string> {
    return this.userService.updatePersonalInformation(
      req.user.sub,
      personalInformation,
    );
  }

  @Put('profile/personalsettings')
  @UseGuards(AuthGuard('jwt'))
  async updatePersonalSettings(
    @Request() req: any,
    @Body() personalSettings: PersonalSettings,
  ): Promise<string> {
    return this.userService.updatePersonalSettings(
      req.user.sub,
      personalSettings,
    );
  }

  @Put('profile/password')
  @UseGuards(AuthGuard('jwt'))
  async updatePassword(
    @Request() req: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<string> {
    return this.userService.updatePassword(req.user.sub, updatePasswordDto);
  }

  @Post('profile/subscription')
  @UseGuards(AuthGuard('jwt'))
  async newSubscription(
    @Request() req: any,
    @Body() newSubscriptionDto: NewSubscriptionDto,
  ): Promise<NewSubscriptionSessionDto> {
    return this.userService.newSubscription(req.user.sub, newSubscriptionDto);
  }

  @Delete('profile/subscription')
  @UseGuards(AuthGuard('jwt'))
  async cancelSubscription(@Request() req: any): Promise<string> {
    return this.userService.cancelSubscription(req.user.sub);
  }

  @Put('profile/subscription/confirm')
  @UseGuards(AuthGuard('jwt'))
  async confirmSubscription(
    @Request() req: any,
    @Query() query: any,
  ): Promise<string> {
    return this.userService.confirmSubscription(req.user.sub, query.session_id);
  }

  @Get('subscription')
  async getAvailableAboSubscriptions(): Promise<SubscriptionDto[]> {
    return this.userService.getAvailableSubscriptions();
  }

  @Put('confirm')
  async confirmEmail(@Query() query: any): Promise<string> {
    const userId = query.userId;
    const token = query.token;

    return this.userService.confirmEmail(userId, token);
  }

  @Post('admin')
  async addAdmin(@Body() newAdminDto: NewAdminDto): Promise<UserDto> {
    return (await this.userService.addAdmin(newAdminDto, true)) as UserDto;
  }

  @Put('resetpassword')
  async resetPassword(@Body() emailDto: EmailDto): Promise<string> {
    return this.userService.resetPassword(emailDto.email);
  }

  @Put('setnewpassword')
  async setNewPassword(
    @Query() query: any,
    @Body() passwordDto: PasswordDto,
  ): Promise<string> {
    const userId = query.userId;
    const token = query.token;

    return this.userService.setNewPassword(userId, token, passwordDto.password);
  }
}
