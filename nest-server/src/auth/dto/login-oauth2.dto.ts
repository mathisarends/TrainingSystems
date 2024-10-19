import { IsString } from 'class-validator';

export class LoginOAuth2Dto {
  @IsString()
  credential: string;
}
