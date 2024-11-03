import { Controller, Get, NotFoundException } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('auth-state')
export class AuthStateController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async determineAuthenticationStatus(@GetUser() userId: string) {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User is not authenticated');
    }
  }
}
