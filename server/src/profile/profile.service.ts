import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfileService {
  constructor(private userService: UsersService) {}

  async getProfile(id: string) {
    const foundUser = await this.userService.getUserById(id);
    return this.mapToProfileDto(foundUser);
  }

  updateProfilePicture(userId: string, updatedUserDto: UpdateUserDto) {
    return this.userService.updateUser(userId, updatedUserDto);
  }

  deleteAccount() {
    return { message: 'User account deleted' };
  }

  private mapToProfileDto(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    };
  }
}
