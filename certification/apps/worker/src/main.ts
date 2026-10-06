import dotenv from 'dotenv';
import { Redis } from 'ioredis';
import pino from 'pino';
import { randomUUID } from 'node:crypto';
import { parseWorkerEnv } from '@centaur/lms-config';
import { startMediaProcessor } from './media-processor.js';
import { startCertificateProcessor } from './certificate-processor.js';

dotenv.config({ path: '../../.env' });
const environment = parseWorkerEnv(process.env);
const logger = pino({ level: environment.LOG_LEVEL });
const redis = new Redis(environment.REDIS_URL, { maxRetriesPerRequest: null });
const processor = startMediaProcessor(redis, logger);
const certificateProcessor = startCertificateProcessor(redis, logger);
const heartbeatKey = 'lms:workers:heartbeat';
const workerInstanceId = `${process.pid}:${randomUUID()}`;
let processorsReady = false;
const heartbeatTimer = setInterval(() => {
  if (!processorsReady) return;
  const timestamp = Date.now();
  void redis.zadd(heartbeatKey, timestamp, workerInstanceId)
    .then(() => redis.zremrangebyscore(heartbeatKey, '-inf', timestamp - 60_000))
    .then(() => redis.expire(heartbeatKey, 120))
    .catch((error: unknown) => logger.error({ err: error, event: 'worker.heartbeat_failed' }, 'Worker health heartbeat failed'));
}, 10_000);
heartbeatTimer.unref();
const writeHeartbeat = () => {
  if (!processorsReady) return;
  const timestamp = Date.now();
  void redis.zadd(heartbeatKey, timestamp, workerInstanceId)
    .then(() => redis.expire(heartbeatKey, 120))
    .catch((error: unknown) => logger.error({ err: error, event: 'worker.heartbeat_failed' }, 'Worker health heartbeat failed'));
};
void Promise.all([processor.ready, certificateProcessor.ready]).then(() => {
  processorsReady = true;
  writeHeartbeat();
});

redis.on('ready', () => logger.info({ event: 'worker.ready' }, 'Worker connected to Redis'));
redis.on('error', (error: Error) => logger.error({ err: error, event: 'worker.redis_error' }, 'Worker Redis connection error'));

let stopping = false;
async function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  clearInterval(heartbeatTimer);
  logger.info({ signal, event: 'worker.shutdown' }, 'Worker shutting down');
  await redis.zrem(heartbeatKey, workerInstanceId).catch(() => undefined);
  await processor.close();
  await certificateProcessor.close();
  await redis.quit();
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
