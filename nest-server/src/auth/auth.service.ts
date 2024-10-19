import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  async register(createUserDto: CreateUserDto) {}

  async login() {}
}
