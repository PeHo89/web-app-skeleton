import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from '../dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { NewUserDto } from '../dto/newUser.dto';

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
  async getUserById(@Request() req): Promise<UserDto> {
    return (await this.userService.getUserById(req.user.sub, true)) as UserDto;
  }

  @Get('confirm')
  async confirmEmail(@Query() query: any): Promise<string> {
    const userId = query.userId;
    const token = query.token;

    return this.userService.confirmEmail(userId, token);
  }
}
