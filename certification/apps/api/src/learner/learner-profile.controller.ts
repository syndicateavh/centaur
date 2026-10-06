import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { AuthService } from '../auth/auth.service.js';
import { PermissionsGuard, RequirePermissions } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';

@Controller('learner/profile')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('learner:dashboard:view')
export class LearnerProfileController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Get()
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.auth.getUser(request.authUserId!);
  }
}
