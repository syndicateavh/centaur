import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { SessionService, sessionTokenFrom } from './session.service.js';
import type { AuthenticatedRequest } from './auth.types.js';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(@Inject(SessionService) private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext) {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();
    const session = await this.sessions.authenticateAndRoll(sessionTokenFrom(request), response);
    if (!session) {
      throw new UnauthorizedException({ code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' });
    }
    request.authUserId = session.userId;
    return true;
  }
}
