import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const SECRET: string = process.env.jwt_secret!;
console.log('🚀 ~ SECRET:', SECRET);

class AuthService {
  authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user) {
      next();
    } else {
      const token = req.cookies['jwt-token'] || '';
      console.log('🚀 ~ AuthService ~ token:', token);
      try {
        res.locals.user = this.verifyToken(token);
        next();
      } catch {
        res.status(401).json({ error: 'Invalid jwt ' });
      }
    }
  };

  createAndSetToken(userClaimSet: Record<string, unknown>, res: Response) {
    const token = jwt.sign(userClaimSet, SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    res.cookie('jwt-token', token);
  }

  verifyToken(token: string) {
    return jwt.verify(token, SECRET);
  }

  removeToken(res: Response) {
    res.clearCookie('jwt-token');
  }
}

export const authService = new AuthService();
