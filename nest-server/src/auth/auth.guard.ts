import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { IS_PUBLIC_ROUTE_KEY } from './no-guard.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['jwt-token'] || '';

    try {
      const userClaimsSet = this.authService.verifyToken(token) as JwtPayload;
      const user = await this.userService.getUserById(userClaimsSet.id);

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
