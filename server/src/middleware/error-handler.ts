import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Central error handling middleware.
 * This middleware catches any errors that occur during the execution of previous middleware or route handlers,
 * logs the stack trace, and sends a standardized error response to the client.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({ error: 'Interner Serverfehler' });
}

/**
 * Async handler middleware.
 * This function wraps an asynchronous route handler and ensures that any errors that occur within the function
 * are properly caught and passed to the central error handling middleware.
 *
 * By using this wrapper, you don't need to manually add `try/catch` blocks in your async route handlers,
 * as any errors that occur will be automatically caught and forwarded to the next middleware (typically your error handler).
 *
 */
export const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};