import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // JWT-Modul importieren
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [AuthService, TokenService],
  exports: [AuthService, TokenService],
  controllers: [AuthController],
})
export class AuthModule {}
