import { Body, Controller, Get, Inject, Param, ParseIntPipe, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { PermissionsGuard, RequirePermissions } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';
import { MediaService } from './media.service.js';
import { mediaUploadInputSchema, type MediaUploadInput } from './media.schemas.js';

@Controller('admin/media')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('admin:courses:manage')
export class AdminMediaController {
  constructor(@Inject(MediaService) private readonly media: MediaService) {}

  @Get('lessons/:lessonId')
  listForLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.media.listForLesson(lessonId);
  }

  @Post('uploads')
  startUpload(@Body(new ZodValidationPipe(mediaUploadInputSchema)) input: MediaUploadInput, @Req() request: AuthenticatedRequest) {
    return this.media.startUpload(request.authUserId!, input);
  }

  @Get('uploads/:mediaId/parts/:partNumber')
  createPartUrl(
    @Req() request: AuthenticatedRequest,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Param('partNumber', ParseIntPipe) partNumber: number,
  ) {
    return this.media.createPartUrl(request.authUserId!, mediaId, partNumber);
  }

  @Post('uploads/:mediaId/complete')
  complete(@Req() request: AuthenticatedRequest, @Param('mediaId', ParseUUIDPipe) mediaId: string) {
    return this.media.completeUpload(request.authUserId!, mediaId);
  }

  @Post('uploads/:mediaId/abort')
  abort(@Req() request: AuthenticatedRequest, @Param('mediaId', ParseUUIDPipe) mediaId: string) {
    return this.media.abortUpload(request.authUserId!, mediaId);
  }

  @Post('uploads/:mediaId/retry')
  retry(@Param('mediaId', ParseUUIDPipe) mediaId: string) {
    return this.media.retryProcessing(mediaId);
  }
}
