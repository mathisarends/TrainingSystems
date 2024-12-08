import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async loginOAuth2User(token: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const { email, name } = payload;
    let user = await this.userService.getUserByEmail(email);

    if (user) {
      return user;
    }

    const profilePicture = this.setDefaultProfilePictureBasedOnFirstCharacter(name);
    const userDto = new CreateUserDto(name, email, profilePicture);

    return await this.userService.createUser(userDto);
  }

  private setDefaultProfilePictureBasedOnFirstCharacter(username: string): string {
    const firstLetter = username[0].toUpperCase();
    return `/images/profile/${firstLetter}.webp`;
  }
}
