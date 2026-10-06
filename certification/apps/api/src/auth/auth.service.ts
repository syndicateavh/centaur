import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import type { Response } from 'express';
import type { createDatabase } from '@centaur/lms-database';
import type { LoginInput, RegisterInput, SessionUser } from '@centaur/lms-shared';
import { permissions, rolePermissions, roles, userRoles, users } from '@centaur/lms-database';
import { DATABASE_CLIENT } from '../tokens.js';
import { hashPassword, verifyPassword } from './password.js';
import { AuthRateLimitService } from './rate-limit.service.js';
import { SessionService } from './session.service.js';

type Database = ReturnType<typeof createDatabase>;

@Injectable()
export class AuthService {
  private readonly dummyHash = hashPassword(randomBytes(32).toString('hex'));

  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: Database,
    @Inject(AuthRateLimitService) private readonly limits: AuthRateLimitService,
    @Inject(SessionService) private readonly sessions: SessionService,
  ) {}

  async register(input: RegisterInput, ip: string, previousToken: string | undefined, response: Response) {
    const email = this.normalizeEmail(input.email);
    await this.limits.allow(ip, email, 'register');

    const passwordHash = await hashPassword(input.password);
    let userId: string;
    try {
      userId = await this.database.db.transaction(async (transaction) => {
        const [learnerRole] = await transaction.select({ id: roles.id }).from(roles).where(eq(roles.code, 'LEARNER')).limit(1);
        if (!learnerRole) throw new Error('The LEARNER role has not been initialized. Apply database migrations first.');
        const [user] = await transaction.insert(users).values({
          email,
          passwordHash,
          displayName: input.displayName?.trim() || null,
        }).returning({ id: users.id });
        await transaction.insert(userRoles).values({ userId: user!.id, roleId: learnerRole.id });
        return user!.id;
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException({ code: 'EMAIL_ALREADY_REGISTERED', message: 'An account already exists for this email.' });
      }
      throw error;
    }

    await this.sessions.create(userId, response, previousToken);
    return this.getUser(userId);
  }

  async login(input: LoginInput, ip: string, previousToken: string | undefined, response: Response) {
    const email = this.normalizeEmail(input.email);
    const rateLimitKey = await this.limits.allow(ip, email, 'login');
    const [user] = await this.database.db.select().from(users).where(eq(users.email, email)).limit(1);
    const validPassword = await verifyPassword(input.password, user?.passwordHash ?? await this.dummyHash);

    if (!user || !validPassword) {
      throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' });
    }

    await this.limits.clear(rateLimitKey);
    await this.sessions.create(user.id, response, previousToken);
    return this.getUser(user.id);
  }

  async getUser(userId: string): Promise<SessionUser> {
    const [user] = await this.database.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new UnauthorizedException({ code: 'UNAUTHENTICATED', message: 'Please sign in to continue.' });
    }
    const assignments = await this.database.db.select({
      roleCode: roles.code,
      permissionCode: permissions.code,
    }).from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId));

    return this.toSessionUser(user, assignments.map(({ roleCode, permissionCode }) => ({ roleCode, permissionCode })));
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private toSessionUser(
    user: typeof users.$inferSelect,
    assignments: Array<{ roleCode: string; permissionCode: string | null }>,
  ): SessionUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
      roles: [...new Set(assignments.map(({ roleCode }) => roleCode))],
      permissions: [...new Set(assignments.flatMap(({ permissionCode }) => permissionCode ? [permissionCode] : []))],
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    let current: unknown = error;
    for (let depth = 0; depth < 4 && typeof current === 'object' && current !== null; depth += 1) {
      if ('code' in current && current.code === '23505') return true;
      current = 'cause' in current ? current.cause : undefined;
    }
    return false;
  }
}
