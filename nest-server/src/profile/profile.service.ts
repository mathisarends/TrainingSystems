import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  getProfile() {
    return { message: 'User profile data' };
  }

  updateProfilePicture() {
    return { message: 'Profile picture updated' };
  }

  deleteAccount() {
    return { message: 'User account deleted' };
  }
}
