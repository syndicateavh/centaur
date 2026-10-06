import { Controller, Get, Inject, Param, ParseUUIDPipe, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { PermissionsGuard, RequirePermissions } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { MediaService } from './media.service.js';

@Controller('learner')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('learner:dashboard:view')
export class LearnerMediaController {
  constructor(@Inject(MediaService) private readonly media: MediaService) {}

  @Get('courses/:courseId/lessons/:lessonId/media')
  getLessonMedia(
    @Req() request: AuthenticatedRequest,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.media.getLessonPlayback(request.authUserId!, courseId, lessonId);
  }

  @Get('media/:mediaId/manifest')
  async getManifest(
    @Req() request: AuthenticatedRequest,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Query('key') key: string,
    @Res() response: Response,
  ) {
    const manifest = await this.media.getManifest(request.authUserId!, mediaId, key);
    response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    response.setHeader('Cache-Control', 'private, no-store');
    response.send(manifest);
  }

  @Get('media/:mediaId/asset')
  async getAsset(
    @Req() request: AuthenticatedRequest,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Query('key') key: string,
    @Res() response: Response,
  ) {
    const asset = await this.media.getProtectedAsset(request.authUserId!, mediaId, key);
    response.setHeader('Cache-Control', 'private, max-age=60');
    if ('manifest' in asset) {
      response.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      response.setHeader('Cache-Control', 'private, no-store');
      response.send(asset.manifest);
      return;
    }
    response.redirect(302, asset.url);
  }
}
