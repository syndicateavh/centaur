import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { CSRF_COOKIE_NAME } from './auth.types.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly expectedOrigin: string) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) return true;

    const origin = request.headers.origin;
    const cookieToken = request.cookies?.[CSRF_COOKIE_NAME] as string | undefined;
    const headerToken = request.headers['x-csrf-token'];
    const validHeader = typeof headerToken === 'string';
    const validTokens = cookieToken && validHeader && this.sameToken(cookieToken, headerToken);

    if (origin !== new URL(this.expectedOrigin).origin || !validTokens) {
      throw new ForbiddenException({ code: 'CSRF_INVALID', message: 'Request origin or CSRF token is invalid.' });
    }
    return true;
  }

  private sameToken(left: string, right: string) {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
