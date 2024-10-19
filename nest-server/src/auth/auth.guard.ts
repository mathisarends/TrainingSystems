import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { IS_PUBLIC_ROUTE_KEY } from './no-guard.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['jwt-token'] || '';

    try {
      const user = this.authService.verifyToken(token);
      request['user'] = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  /**
   * Checks whether the current route is marked as public (no authentication required).
   */
  private isPublicRoute(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
