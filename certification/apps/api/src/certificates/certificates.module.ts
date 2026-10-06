import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LearnerModule } from '../learner/learner.module.js';
import { MediaModule } from '../media/media.module.js';
import { AdminCertificatesController, LearnerCertificatesController, PublicCertificateVerificationController } from './certificates.controller.js';
import { CertificatesService } from './certificates.service.js';

@Module({
  imports: [AuthModule, LearnerModule, MediaModule],
  controllers: [LearnerCertificatesController, AdminCertificatesController, PublicCertificateVerificationController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
