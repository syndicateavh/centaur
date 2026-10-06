import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthService } from './auth.service.js';
import { SessionAuthGuard } from './session-auth.guard.js';

@Controller()
export class MeController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getMe(@Req() request: AuthenticatedRequest) {
    return { user: await this.auth.getUser(request.authUserId!) };
  }
}
