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
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';
import { UserDto } from '../../../common/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUser(): Promise<User[]> {
    return this.userService.getAllUser();
  }

  @Post()
  addUser(@Body() userDto: UserDto): Promise<User> {
    return this.userService.addUser(userDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getUserById(@Request() req): Promise<User> {
    return this.userService.getUserById(req.user.id);
  }
}
