import { Request, Response, NextFunction } from 'express';

/**
 * Sets security-related HTTP headers.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function.
 */

let count = 0;

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Uncomment the following line when ready for HTTPS certificates
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'); // HSTS-HEADER

  console.log('🚀 ~ count:', count);
  count++;

  res.set('Content-Security-Policy', "frame-ancestors 'none'");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}

/**
 * Sets CORS headers and handles preflight requests.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function.
 */
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

/**
 * Checks if the request origin is allowed.
 * @param origin - The origin of the request.
 * @returns True if the origin is allowed, false otherwise.
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  const allowedOrigins = [
    'http://localhost:4200' // Add your Angular app origin here
  ];
  return origin ? allowedOrigins.includes(origin) : false;
}

/**
 * Checks if the request is a CORS preflight request.
 * @param req - The HTTP request object.
 * @returns True if the request is a preflight request, false otherwise.
 */
export function isPreflight(req: Request): boolean {
  return req.method === 'OPTIONS' && !!req.get('Origin') && !!req.get('Access-Control-Request-Method');
}
