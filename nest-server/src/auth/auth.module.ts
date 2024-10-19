import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // JWT-Modul importieren
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.jwt_secret,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
