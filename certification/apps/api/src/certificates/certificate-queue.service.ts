import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

export const CERTIFICATE_QUEUE = 'certificate-processing';

@Injectable()
export class CertificateQueueService implements OnApplicationShutdown {
  private readonly connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
  private readonly queue = new Queue(CERTIFICATE_QUEUE, { connection: this.connection });

  async enqueue(certificateId: string, retry = false) {
    const jobId = `certificate-${certificateId}`;
    const existing = await this.queue.getJob(jobId);
    if (existing && retry && (await existing.getState()) === 'failed') await existing.remove();
    return this.queue.add('generate-certificate', { certificateId }, {
      jobId,
      attempts: 5,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 30 * 24 * 60 * 60, count: 10_000 },
      removeOnFail: { age: 30 * 24 * 60 * 60, count: 10_000 },
    });
  }

  async onApplicationShutdown() {
    await this.queue.close();
    await this.connection.quit();
  }
}
