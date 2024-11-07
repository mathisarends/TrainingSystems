import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  createAndSetToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = this.jwtService.sign(userClaimSet, { expiresIn: '30d' });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt-token', token, {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: !!isProduction,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  verifyToken(token: string): JwtPayload | string {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  removeToken(res: Response) {
    res.clearCookie('jwt-token');
  }
}
