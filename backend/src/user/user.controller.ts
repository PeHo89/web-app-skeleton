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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UserDto } from '../dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { NewUserDto } from '../dto/newUser.dto';
import { File } from '../file/file.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
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

  @Post('profile/image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('profileImage'))
  async addProfileImage(
    @Request() req: any,
    @UploadedFile() image: File,
  ): Promise<void> {
    this.userService.addProfileImage(req.user.sub, image);
  }

  @Get('profile/image')
  @UseGuards(AuthGuard('jwt'))
  async getProfileImage(@Request() req: any): Promise<any> {
    return this.userService.getProfileImage(req.user.sub);
  }

  @Get('confirm')
  async confirmEmail(@Query() query: any): Promise<string> {
    const userId = query.userId;
    const token = query.token;

    return this.userService.confirmEmail(userId, token);
  }
}
