import { Controller, Delete, Get } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Delete()
  deleteUser(@GetUser() userId: string) {
    return this.userService.deleteUserById(userId);
  }
}
