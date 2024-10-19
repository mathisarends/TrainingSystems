import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  authenticationMiddleware(req: Request, res: Response, next: Function) {
    if (res.locals.user) {
      next();
    }
    const token = req.cookies['jwt-token'] || '';
    try {
      res.locals.user = this.verifyToken(token);
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }

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
