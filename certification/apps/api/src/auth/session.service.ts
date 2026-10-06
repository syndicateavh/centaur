import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../tokens.js';
import { CSRF_COOKIE_NAME, SESSION_COOKIE_NAME, type SessionRecord } from './auth.types.js';

@Injectable()
export class SessionService {
  private readonly ttlSeconds: number;
  private readonly secureCookie: boolean;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(ConfigService) config: ConfigService,
  ) {
    this.ttlSeconds = config.get<number>('SESSION_TTL_SECONDS', 2_592_000);
    this.secureCookie = config.get<string>('NODE_ENV') === 'production';
  }

  async create(userId: string, response: Response, previousToken?: string) {
    if (previousToken) await this.delete(previousToken);
    const token = randomBytes(32).toString('base64url');
    const session: SessionRecord = { userId, createdAt: new Date().toISOString() };
    await this.redis.set(this.key(token), JSON.stringify(session), 'EX', this.ttlSeconds);
    this.setSessionCookie(response, token);
  }

  async authenticateAndRoll(token: string | undefined, response: Response) {
    if (!token) return null;
    const key = this.key(token);
    const rawSession = await this.redis.get(key);
    if (!rawSession) return null;

    let session: SessionRecord;
    try {
      session = JSON.parse(rawSession) as SessionRecord;
      if (typeof session.userId !== 'string' || typeof session.createdAt !== 'string') throw new Error('Invalid session payload');
    } catch {
      await this.redis.del(key);
      return null;
    }

    await this.redis.expire(key, this.ttlSeconds);
    this.setSessionCookie(response, token);
    return session;
  }

  async revokeRequestSession(request: Request, response: Response) {
    const token = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (token) await this.delete(token);
    response.clearCookie(SESSION_COOKIE_NAME, this.cookieOptions());
  }

  issueCsrfToken(response: Response) {
    const token = randomBytes(32).toString('base64url');
    response.cookie(CSRF_COOKIE_NAME, token, {
      path: '/',
      secure: this.secureCookie,
      httpOnly: false,
      sameSite: 'strict',
    });
    return token;
  }

  private setSessionCookie(response: Response, token: string) {
    response.cookie(SESSION_COOKIE_NAME, token, {
      ...this.cookieOptions(),
      maxAge: this.ttlSeconds * 1000,
    });
  }

  private cookieOptions() {
    return {
      path: '/',
      httpOnly: true,
      secure: this.secureCookie,
      sameSite: 'lax' as const,
    };
  }

  private async delete(token: string) {
    await this.redis.del(this.key(token));
  }

  private key(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return `lms:session:${tokenHash}`;
  }
}

export function sessionTokenFrom(request: Request) {
  return request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
}
