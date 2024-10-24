import { IsString } from 'class-validator';

export class LoginOAuth2Dto {
  @IsString()
  credential: string;

  @IsString()
  g_csrf_token?: string;
}
