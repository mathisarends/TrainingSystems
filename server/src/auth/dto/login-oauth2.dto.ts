import { IsOptional, IsString } from 'class-validator';

export class LoginOAuth2Dto {
  @IsString()
  credential: string;

  @IsString()
  @IsOptional()
  g_csrf_token?: string;
}
