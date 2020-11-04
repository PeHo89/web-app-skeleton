import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  Inject,
  forwardRef,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { UserDto } from '../../../common/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { NewUserDto } from '../../../common/dto/newUser.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  getAllUser(): Promise<User[]> {
    return this.userService.getAllUser();
  }

  @Post()
  addUser(@Body() newUserDto: NewUserDto): Promise<User> {
    return this.userService.addUser(newUserDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getUserById(@Request() req): Promise<User> {
    // return this.userService.getUserByEmail(req.user.username);
    return this.userService.getUserById(req.user.sub);
  }
}
