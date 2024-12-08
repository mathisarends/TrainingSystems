import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { IS_PUBLIC_ROUTE_KEY } from './no-guard.decorator';
import { TokenService } from './token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Determines whether the current request can proceed by checking if the route is public,
   * or by verifying the user's JWT token and retrieving the corresponding user.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['jwt-token'] || '';

    try {
      const userClaimsSet = this.tokenService.verifyToken(token) as JwtPayload;

      request['userId'] = userClaimsSet.id;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  /**
   * Checks whether the current route is marked as public (no authentication required).
   */
  private isPublicRoute(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [context.getHandler(), context.getClass()]);
  }
}
