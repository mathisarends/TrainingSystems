/* Autor: Mathis Kristoffer Arends */
import { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');   // HSTS-HEADER (einkommentieren, wenn bereit für HTTPS Zertifikate)
  res.set('Content-Security-Policy', "frame-ancestors 'none'");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}

export function corsHeaders(req: Request, res: Response, next: NextFunction) {
  if (isOriginAllowed(req.get('Origin'))) {
    res.set('Access-Control-Allow-Origin', req.get('Origin')!);
    res.set('Access-Control-Allow-Credentials', 'true');
  }

  if (isPreflight(req)) {
    res.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Origin, Accept, Access-Control-Allow-Credentials, x-csrf-token'
    );
    res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.status(204).end();
  } else {
    next();
  }
}

export function isOriginAllowed(origin: string | undefined): boolean {
  const allowedOrigins = ['http://localhost:4200'];
  return origin ? allowedOrigins.includes(origin) : false;
}

export function isPreflight(req: Request): boolean {
  return req.method === 'OPTIONS' && !!req.get('Origin') && !!req.get('Access-Control-Request-Method');
}
