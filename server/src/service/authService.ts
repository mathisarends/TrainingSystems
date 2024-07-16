import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export interface UserClaims extends JwtPayload {
  [key: string]: unknown;
}

class AuthService {
  private static instance: AuthService;
  private SECRET: string = process.env.jwt_secret!;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(`Incoming request URL: ${req.url}`);
    console.log(`Request method: ${req.method}`);

    if (res.locals.user) {
      console.log('User found in res.locals');
      next();
    } else {
      const token = req.cookies['jwt-token'] || '';
      console.log(`Token from cookies: ${token}`);

      try {
        const user = this.verifyToken(token);
        if (user) {
          console.log('Token is valid, user authenticated');
          res.locals.user = user;
          next();
        } else {
          console.log('Token is invalid, sending Unauthorized response');
          res.status(401).json({ error: 'Unauthorized' });
        }
      } catch (error: unknown) {
        console.error('Error verifying token:', (error as Error).message);
        res.status(401).json({ error: 'Unauthorized', message: (error as Error).message });
      }
    }
  };

  createAndSetToken(userClaimSet: UserClaims, res: Response) {
    const token = this.createToken(userClaimSet);
    res.cookie('jwt-token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax' // due to a missing certificate chain, the secure option cannot be used
    });
  }

  createToken(userClaims: UserClaims): string {
    const claims: UserClaims = {
      ...userClaims,
      timestamp: Date.now()
    };
    return jwt.sign(claims, this.SECRET, { algorithm: 'HS256' });
  }

  verifyToken(token: string): UserClaims | null {
    try {
      return jwt.verify(token, this.SECRET) as UserClaims;
    } catch (error) {
      return null;
    }
  }

  refreshToken(token: string, req: Request, res: Response) {
    const userClaims = this.verifyToken(token);
    if (userClaims) {
      this.createAndSetToken(userClaims, res);
    } else {
      throw new Error('Invalid token');
    }
  }

  removeToken(res: Response) {
    res.clearCookie('jwt-token');
  }
}

export const authService = AuthService.getInstance();
