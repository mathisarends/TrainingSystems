import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
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
}
