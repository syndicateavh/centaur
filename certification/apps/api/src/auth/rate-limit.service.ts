import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../tokens.js';

@Injectable()
export class AuthRateLimitService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async allow(ip: string, email: string, action: 'register' | 'login') {
    const normalizedEmailHash = createHash('sha256').update(email).digest('hex');
    const ipLimit = action === 'register' ? 10 : 30;
    const ipWindowSeconds = action === 'register' ? 3600 : 900;
    const emailLimit = action === 'register' ? 5 : 10;
    const emailWindowSeconds = action === 'register' ? 3600 : 900;

    const ipCount = await this.increment(`lms:rate:auth:${action}:ip:${ip}`, ipWindowSeconds);
    const emailKey = `lms:rate:auth:${action}:email:${normalizedEmailHash}`;
    const emailCount = await this.increment(emailKey, emailWindowSeconds);

    if (ipCount > ipLimit || emailCount > emailLimit) {
      throw new HttpException({ code: 'AUTH_RATE_LIMITED', message: 'Too many attempts. Please try again later.' }, HttpStatus.TOO_MANY_REQUESTS);
    }

    return emailKey;
  }

  async clear(key: string) {
    await this.redis.del(key);
  }

  private async increment(key: string, ttlSeconds: number) {
    const script = "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return n";
    return Number(await this.redis.eval(script, 1, key, ttlSeconds));
  }
}
