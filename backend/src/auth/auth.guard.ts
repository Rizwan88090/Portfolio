import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, SESSION_COOKIE } from './auth.service';
import { AdminSession } from './admin-session.entity';
import { readCookie } from './cookies';

export type AuthedRequest = Request & { session: AdminSession };

/** Allows the request only with a valid admin session cookie. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const session = await this.auth.validate(readCookie(req, SESSION_COOKIE));
    if (!session) throw new UnauthorizedException('Please sign in');
    req.session = session;
    return true;
  }
}
