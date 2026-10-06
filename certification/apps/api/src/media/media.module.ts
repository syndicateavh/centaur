import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AdminMediaController } from './admin-media.controller.js';
import { LearnerMediaController } from './learner-media.controller.js';
import { MediaQueueService } from './media-queue.service.js';
import { MediaService } from './media.service.js';
import { MediaStorageService } from './media-storage.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminMediaController, LearnerMediaController],
  providers: [MediaService, MediaStorageService, MediaQueueService],
  exports: [MediaStorageService],
})
export class MediaModule {}
