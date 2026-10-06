import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { PermissionsGuard, RequirePermissions } from '../auth/authorization.js';
import { SessionAuthGuard } from '../auth/session-auth.guard.js';
import { ZodValidationPipe } from '../auth/zod-validation.pipe.js';
import { CertificatesService } from './certificates.service.js';

const adminQuerySchema = z.object({
  q: z.string().trim().max(160).optional(),
  status: z.enum(['pending', 'processing', 'ready', 'failed', 'revoked']).optional(),
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
const revokeSchema = z.object({ reason: z.string().trim().min(10).max(1000) });

@Controller('learner/certificates')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('learner:dashboard:view')
export class LearnerCertificatesController {
  constructor(@Inject(CertificatesService) private readonly certificates: CertificatesService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest) { return this.certificates.listLearnerCertificates(request.authUserId!); }

  @Get(':certificateId/download')
  download(@Req() request: AuthenticatedRequest, @Param('certificateId', ParseUUIDPipe) certificateId: string) {
    return this.certificates.getLearnerDownloadUrl(request.authUserId!, certificateId);
  }
}

@Controller('admin/certificates')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('admin:courses:manage')
export class AdminCertificatesController {
  constructor(@Inject(CertificatesService) private readonly certificates: CertificatesService) {}

  @Get()
  list(@Query(new ZodValidationPipe(adminQuerySchema)) query: z.infer<typeof adminQuerySchema>) {
    return this.certificates.searchAdminCertificates({ ...query, q: query.q, status: query.status });
  }

  @Get(':certificateId')
  detail(@Param('certificateId', ParseUUIDPipe) certificateId: string) {
    return this.certificates.getAdminDetail(certificateId);
  }

  @Post(':certificateId/revoke')
  revoke(
    @Req() request: AuthenticatedRequest,
    @Param('certificateId', ParseUUIDPipe) certificateId: string,
    @Body(new ZodValidationPipe(revokeSchema)) body: z.infer<typeof revokeSchema>,
  ) { return this.certificates.revoke(certificateId, request.authUserId!, body.reason); }

  @Post(':certificateId/retry')
  retry(@Param('certificateId', ParseUUIDPipe) certificateId: string) { return this.certificates.retry(certificateId); }
}

@Controller('verify')
export class PublicCertificateVerificationController {
  constructor(@Inject(CertificatesService) private readonly certificates: CertificatesService) {}

  @Get(':publicCertificateId')
  verify(@Param('publicCertificateId') publicCertificateId: string) {
    if (!/^CERT-[A-F0-9]{48}$/.test(publicCertificateId)) return this.certificates.verify('');
    return this.certificates.verify(publicCertificateId);
  }
}
