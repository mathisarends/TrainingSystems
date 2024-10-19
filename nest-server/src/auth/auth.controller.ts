import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginOAuth2Dto } from './dto/login-oauth2.dto';
import { TokenService } from './token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private tokenService: TokenService,
  ) {}

  @Post('login/oauth2')
  async loginViahOauth2(
    @Body() loginOAuth2Dto: LoginOAuth2Dto,
    @Res() res: Response,
  ) {
    const user = await this.authService.loginOAuth2User(
      loginOAuth2Dto.credential,
    );
    this.tokenService.createAndSetToken({ id: user.id }, res);

    const redirectUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4200?login=success'
        : 'https://trainingsystemsre.onrender.com?login=success';

    res.cookie('authTemp', 'some-temp-value', {
      maxAge: 30000,
    });

    res.redirect(redirectUrl);
  }
}
