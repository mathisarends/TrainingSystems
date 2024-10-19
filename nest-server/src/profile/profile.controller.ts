import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Req() req: Request) {
    const user = req['user'];
    return this.profileService.getProfile(user.id);
  }

  @Post()
  updateProfilePicture(
    @Req() req: Request,
    @Body() updatedUserDto: UpdateUserDto,
  ) {
    const user = req['user'];
    return this.profileService.updateProfilePicture(user.id, updatedUserDto);
  }
}
