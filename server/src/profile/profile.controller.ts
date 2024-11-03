import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@GetUser() userId: string) {
    return await this.profileService.getProfile(userId);
  }

  @Post()
  updateProfilePicture(
    @GetUser() userId: string,
    @Body() updatedUserDto: UpdateUserDto,
  ) {
    return this.profileService.updateProfilePicture(userId, updatedUserDto);
  }
}
