import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const SECRET: string = process.env.jwt_secret!;
console.log('🚀 ~ SECRET:', SECRET);

class AuthService {
  authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Spezifischere Logs hinzufügen
    console.log('Incoming request:');
    console.log(`- URL: ${req.url}`);
    console.log(`- IP: ${req.ip}`);

    console.log(`- Headers: ${JSON.stringify(req.headers, null, 2)}`);
    console.log(`- Cookies: ${JSON.stringify(req.cookies, null, 2)}`);

    if (res.locals.user) {
      next();
    } else {
      const token = req.cookies['jwt-token'] || '';
      console.log('🚀 ~ AuthService ~ token:', token);
      try {
        res.locals.user = this.verifyToken(token);
        next();
      } catch {
        console.log('Fehler beim token');
        res.status(401).json({ error: 'Invalid jwt ' });
        res.redirect('/users/sign-in');
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
