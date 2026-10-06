import { Body, Controller, Get, Inject, Param, ParseIntPipe, ParseUUIDPipe, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { PermissionsGuard, RequirePermissions } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';
import { MediaService } from './media.service.js';
import { mediaLibraryQuerySchema, mediaUploadInputSchema, type MediaLibraryQuery, type MediaUploadInput } from './media.schemas.js';

@Controller('admin/media')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('admin:courses:manage')
export class AdminMediaController {
  constructor(@Inject(MediaService) private readonly media: MediaService) {}

  @Get()
  list(@Query(new ZodValidationPipe(mediaLibraryQuerySchema)) query: MediaLibraryQuery) {
    return this.media.listAdminMedia(query);
  }

  @Get('lessons/:lessonId')
  listForLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.media.listForLesson(lessonId);
  }

  @Get('lessons/:lessonId/preview')
  previewLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.media.getAdminLessonPreview(lessonId);
  }

  @Get('uploads/:mediaId/manifest')
  async previewManifest(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Query('key') key: string,
    @Res() response: Response,
  ) {
    const manifest = await this.media.getAdminPreviewManifest(mediaId, key);
    response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    response.setHeader('Cache-Control', 'private, no-store');
    response.send(manifest);
  }

  @Get('uploads/:mediaId/asset')
  async previewAsset(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Query('key') key: string,
    @Res() response: Response,
  ) {
    const asset = await this.media.getAdminPreviewAsset(mediaId, key);
    response.setHeader('Cache-Control', 'private, max-age=60');
    if ('manifest' in asset) {
      response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      response.setHeader('Cache-Control', 'private, no-store');
      response.send(asset.manifest);
      return;
    }
    response.redirect(302, asset.url);
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
