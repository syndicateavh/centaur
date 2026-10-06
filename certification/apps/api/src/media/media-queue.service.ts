import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

export const MEDIA_PROCESSING_QUEUE = 'media-processing';

@Injectable()
export class MediaQueueService implements OnApplicationShutdown {
  private readonly connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
  private readonly queue = new Queue(MEDIA_PROCESSING_QUEUE, { connection: this.connection });

  async enqueue(mediaId: string, retry = false) {
    const existing = await this.queue.getJob(`media-${mediaId}`);
    if (existing && retry && (await existing.getState()) === 'failed') await existing.remove();
    return this.queue.add('process-media', { mediaId }, {
      jobId: `media-${mediaId}`,
      attempts: 4,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 7 * 24 * 60 * 60, count: 5_000 },
      removeOnFail: { age: 30 * 24 * 60 * 60, count: 5_000 },
    });
  }

  async onApplicationShutdown() {
    await this.queue.close();
    await this.connection.quit();
  }
}
