import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/user.model';

/**
 * Custom decorator that extracts the authenticated user from the request object.
 * This decorator should be used in controllers to access the user attached to the request
 * after authentication middleware or guards have been applied.
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
