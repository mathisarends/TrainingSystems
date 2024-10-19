import { Controller, Delete, Get, Post, Req } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@Req() req: Request) {
    const user = req['user'];
    return this.profileService.getProfile(user.id);
  }

  @Post('update-profile-picture')
  updateProfilePicture() {
    return this.profileService.updateProfilePicture();
  }

  @Delete('delete-account')
  deleteAccount() {
    return this.profileService.deleteAccount();
  }
}
