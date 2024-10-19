import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Bitte eine gültige E-Mail-Adresse eingeben' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Das Passwort muss mindestens 6 Zeichen lang sein' })
  password: string;
}
