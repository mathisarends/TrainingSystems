import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile() {
    return this.profileService.getProfile();
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
