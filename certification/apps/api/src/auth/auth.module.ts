import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { MeController } from './me.controller.js';
import { AuthService } from './auth.service.js';
import { AuthRateLimitService } from './rate-limit.service.js';
import { SessionService } from './session.service.js';
import { SessionAuthGuard } from './session-auth.guard.js';
import { PermissionsGuard } from './authorization.js';
import { LearnerDashboardController } from './learner-dashboard.controller.js';
import { AdminDashboardController } from './admin-dashboard.controller.js';

@Module({
  controllers: [AuthController, MeController, LearnerDashboardController, AdminDashboardController],
  providers: [AuthService, AuthRateLimitService, SessionService, SessionAuthGuard, PermissionsGuard],
  exports: [AuthService, SessionService, SessionAuthGuard, PermissionsGuard],
})
export class AuthModule {}
