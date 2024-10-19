import { Controller, Delete, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Delete()
  deleteUser(@Req() req: Request) {
    const user = req['user'];
    return this.userService.deleteUserById(user.id);
  }
}
