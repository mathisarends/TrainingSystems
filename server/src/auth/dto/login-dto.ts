import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Bitte eine gültige E-Mail-Adresse eingeben' })
  @IsNotEmpty({ message: 'E-Mail darf nicht leer sein' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Das Passwort muss mindestens 6 Zeichen lang sein' })
  @IsNotEmpty({ message: 'Passwort darf nicht leer sein' })
  password: string;
}
