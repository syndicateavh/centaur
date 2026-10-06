import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { createDatabase } from '@centaur/lms-database';
import { Redis } from 'ioredis';
import { parseApiEnv } from '@centaur/lms-config';
import { DATABASE_CLIENT, REDIS_CLIENT } from './tokens.js';

const environment = parseApiEnv(process.env);
const database = createDatabase(environment.DATABASE_URL, environment.DATABASE_POOL_MAX);
const redis = new Redis(environment.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });

class InfrastructureLifecycle implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await Promise.all([database.client.end(), redis.quit().catch(() => undefined)]);
  }
}

@Global()
@Module({
  providers: [
    { provide: DATABASE_CLIENT, useValue: database },
    { provide: REDIS_CLIENT, useValue: redis },
    InfrastructureLifecycle,
  ],
  exports: [DATABASE_CLIENT, REDIS_CLIENT],
})
export class InfrastructureModule {}
