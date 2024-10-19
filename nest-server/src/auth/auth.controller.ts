import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/oauth2')
  loginViahOauth2() {}

  @Post('register/oath2')
  registerViaOauth2() {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  /* @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  } */
}
