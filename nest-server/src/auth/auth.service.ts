import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login-dto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password!))) {
      throw new UnauthorizedException('Ungültige E-Mail/Passwort Kombination');
    }

    return user;
  }

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

    const profilePicture =
      this.setDefaultProfilePictureBasedOnFirstCharacter(name);
    const userDto = new CreateUserDto(name, email, profilePicture);
    const userObj = await this.userService.createUser(userDto);
    return await this.userService.createUser(userObj);
  }

  private setDefaultProfilePictureBasedOnFirstCharacter(
    username: string,
  ): string {
    const firstLetter = username[0].toUpperCase();
    return `/images/profile/${firstLetter}.webp`;
  }
}
