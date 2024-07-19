import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const SECRET: string = process.env.jwt_secret!;

class AuthService {
  authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.headers['user-agent'];
    const referer = req.headers['referer'];

    if (res.locals.user) {
      next();
    } else {
      const token = req.cookies['jwt-token'] || '';
      try {
        res.locals.user = this.verifyToken(token);
        next();
      } catch {
        // Anfrage kommt vom agent node und nicht vom browser scheint also in irgendeiner Form automatisiert zu sein. Da ich den Fehler aber nicht ausfindig machen kann senden wir einen statuscode,
        // der von fehlender authentifizerung abweicht zurük.
        if (!referer && userAgent?.includes('node')) {
          res.status(499).end();
          return;
        }

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
