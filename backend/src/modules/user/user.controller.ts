import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser(): Promise<User[]> {
    return this.userService.getUser();
  }

  @Post()
  addUser(@Body() user: User): Promise<User> {
    return this.userService.addUser(user);
  }
}
