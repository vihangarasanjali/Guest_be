import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RequestUser } from 'src/types/request-user.type';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('Missing authorization header');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid authorization header');

    try {
      // Type the JWT payload explicitly
      const payload = this.jwtService.verify<{
        sub: number;
        role: string;
        email: string;
        name: string;
      }>(token, {
        secret: process.env.JWT_SECRET || 'supersecret123',
      });

      // now TS knows payload has the correct shape
      request.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
        name: payload.name,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
