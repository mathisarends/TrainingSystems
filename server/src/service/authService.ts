import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const SECRET: string = process.env.jwt_secret!;

class AuthService {
  authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user) {
      next();
    } else {
      const token = req.cookies['jwt-token'] || '';
      try {
        res.locals.user = this.verifyToken(token);
        next();
      } catch {
        res.status(401).json({ error: 'Invalid jwt ' });
      }
    }
  };

  createAndSetToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '1d' });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt-token', token, {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction ? true : false,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
  }

  verifyToken(token: string) {
    return jwt.verify(token, SECRET);
  }

  removeToken(res: Response) {
    res.clearCookie('jwt-token');
  }
}

export const authService = new AuthService();
