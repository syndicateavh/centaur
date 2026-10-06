import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { createDatabase } from '@centaur/lms-database';
import { permissions, rolePermissions, roles, userRoles } from '@centaur/lms-database';
import type { AuthenticatedRequest } from './auth.types.js';
import { DATABASE_CLIENT } from '../tokens.js';

const REQUIRED_PERMISSIONS = 'authorization:required-permissions';
type Database = ReturnType<typeof createDatabase>;

export const RequirePermissions = (...permissionCodes: string[]) => SetMetadata(REQUIRED_PERMISSIONS, permissionCodes);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(DATABASE_CLIENT) private readonly database: Database,
  ) {}

  async canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    if (required.length === 0) {
      throw new ForbiddenException({ code: 'PERMISSION_POLICY_MISSING', message: 'This route has no access policy configured.' });
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.authUserId) throw new UnauthorizedException({ code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' });

    const assigned = await this.database.db.select({ code: permissions.code }).from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, request.authUserId));
    const granted = new Set(assigned.map(({ code }) => code));
    if (required.every((permission) => granted.has(permission))) return true;

    throw new ForbiddenException({ code: 'PERMISSION_DENIED', message: 'You do not have permission to access this resource.' });
  }
}
