import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export * from './schema.js';

export function createDatabase(connectionString: string, maxConnections = 10) {
  const client = postgres(connectionString, {
    max: maxConnections,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
  return {
    client,
    db: drizzle(client, { schema }),
  };
}
