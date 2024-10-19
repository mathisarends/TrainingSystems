import { SetMetadata } from '@nestjs/common';

/**
 * Key used to store metadata indicating that the route is public (no authentication required).
 */
export const IS_PUBLIC_ROUTE_KEY = 'isPublicRoute';

/**
 * Decorator to mark a route as public, allowing it to bypass authentication.
 *
 * @returns A decorator function that sets the `isPublicRoute` metadata to `true` for the handler or class.
 */
export const NoGuard = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true);
