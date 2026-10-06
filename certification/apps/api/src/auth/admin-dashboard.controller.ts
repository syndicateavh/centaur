import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthService } from './auth.service.js';
import { RequirePermissions, PermissionsGuard } from './authorization.js';
import { SessionAuthGuard } from './session-auth.guard.js';

@Controller('admin')
@UseGuards(SessionAuthGuard, PermissionsGuard)
export class AdminDashboardController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Get('dashboard')
  @RequirePermissions('admin:dashboard:view')
  async getDashboard(@Req() request: AuthenticatedRequest) {
    return { access: 'admin', user: await this.auth.getUser(request.authUserId!) };
  }
}
