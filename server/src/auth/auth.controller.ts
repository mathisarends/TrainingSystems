import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginOAuth2Dto } from './dto/login-oauth2.dto';
import { NoGuard } from './no-guard.decorator';
import { TokenService } from './token.service';

// TODO: auth-state halte ich für nicht so sinnvoll man kann ja alle 403 einfach auf eine login page dann umleiten
// und entsprechend kein fehler anzeigen sollte ja mit zentralem error-handling kein Problem sein.
@NoGuard()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private tokenService: TokenService,
  ) {}

  @Post('login/oauth2')
  async loginViahOauth2(@Body() loginOAuth2Dto: LoginOAuth2Dto, @Res() res: Response) {
    const loggedInUser = await this.authService.loginOAuth2User(loginOAuth2Dto.credential);
    this.tokenService.createAndSetToken({ id: loggedInUser.id }, res);

    const redirectUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4200?login=success'
        : 'https://trainingsystemsre.onrender.com?login=success';

    res.cookie('authTemp', 'some-temp-value', {
      maxAge: 30000,
    });

    res.status(200).json({ message: 'Login erfolgreich ' });
  }

  @Post('login/oauth2/redirect')
  async loginViahOauth2WithRedirect(@Body() loginOAuth2Dto: LoginOAuth2Dto, @Res() res: Response) {
    const loggedInUser = await this.authService.loginOAuth2User(loginOAuth2Dto.credential);
    this.tokenService.createAndSetToken({ id: loggedInUser.id }, res);

    const redirectUrl =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4200?login=success'
        : 'https://trainingsystemsre.onrender.com?login=success';

    res.cookie('authTemp', 'some-temp-value', {
      maxAge: 30000,
    });

    res.redirect(redirectUrl);
  }

  @Post('logout')
  logOut(@Res() res: Response) {
    this.tokenService.removeToken(res);
    console.log('test');
    return res.status(200).json({ message: 'Logout successful' });
  }
}
