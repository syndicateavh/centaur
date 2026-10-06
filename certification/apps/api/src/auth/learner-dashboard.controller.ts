import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.types.js';
import { RequirePermissions, PermissionsGuard } from './authorization.js';
import { SessionAuthGuard } from './session-auth.guard.js';

@Controller('learner')
@UseGuards(SessionAuthGuard, PermissionsGuard)
export class LearnerDashboardController {
  @Get('dashboard')
  @RequirePermissions('learner:dashboard:view')
  getDashboard(@Req() request: AuthenticatedRequest) {
    return { access: 'learner', userId: request.authUserId };
  }
}
