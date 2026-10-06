import { Inject, Injectable } from '@nestjs/common';
import type { HealthStatus } from '@centaur/lms-shared';
import type { Redis } from 'ioredis';
import type { createDatabase } from '@centaur/lms-database';
import { DATABASE_CLIENT, REDIS_CLIENT } from './tokens.js';

type Database = ReturnType<typeof createDatabase>;

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: Database,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async check(requestId: string): Promise<HealthStatus> {
    const [database, redis] = await Promise.all([
      this.database.db.execute('select 1').then(() => 'ok' as const).catch(() => 'error' as const),
      this.redis.ping().then(() => 'ok' as const).catch(() => 'error' as const),
    ]);
    const worker = redis === 'ok'
      ? await this.redis.zcount('lms:workers:heartbeat', String(Date.now() - 30_000), '+inf').then((count) => count > 0 ? 'ok' as const : 'error' as const).catch(() => 'error' as const)
      : 'error';

    return {
      status: database === 'ok' && redis === 'ok' && worker === 'ok' ? 'ok' : 'error',
      requestId,
      checks: { database, redis, worker },
    };
  }
}
