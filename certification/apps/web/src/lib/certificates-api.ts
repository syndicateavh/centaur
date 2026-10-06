import { apiRequest } from './auth-api.js';

export type CertificateStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'revoked';
export interface LearnerCertificate {
  id: string; publicCertificateId: string; status: CertificateStatus; issuedAt: string | null; generatedAt: string | null;
  revokedAt: string | null; learnerName: string; courseTitle: string; completedAt: string;
}
export interface AdminCertificate extends LearnerCertificate { revokedBy: string | null; revocationReason: string | null; email: string }

export const listLearnerCertificates = () => apiRequest<LearnerCertificate[]>('/learner/certificates');
export const getCertificateDownloadUrl = (id: string) => apiRequest<{ url: string }>(`/learner/certificates/${id}/download`);
export const verifyCertificate = (publicId: string) => apiRequest<{
  certificateId: string; status: 'valid' | 'revoked' | 'processing' | 'unavailable'; valid: boolean;
  learnerName: string; courseTitle: string; completedAt: string; issuedAt: string | null;
}>(`/verify/${encodeURIComponent(publicId)}`);
export const listAdminCertificates = (query: { q?: string; status?: string; page?: number }) => {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.status) params.set('status', query.status);
  if (query.page) params.set('page', String(query.page));
  params.set('pageSize', '25');
  return apiRequest<{ items: AdminCertificate[]; page: number; pageSize: number; total: number }>(`/admin/certificates?${params}`);
};
export const getAdminCertificate = (id: string) => apiRequest<{
  certificate: { id: string; publicCertificateId: string; status: CertificateStatus; issuedAt: string | null; generatedAt: string | null; revokedAt: string | null; revokedBy: string | null; revocationReason: string | null; learnerName: string; learnerEmail: string; courseTitle: string; completedAt: string };
  audit: Array<{ id: string; action: string; reason: string | null; createdAt: string; actorEmail: string | null }>;
}>(`/admin/certificates/${id}`);
export const revokeCertificate = (id: string, reason: string) => apiRequest<{ id: string; status: CertificateStatus; revokedAt: string }>(`/admin/certificates/${id}/revoke`, { method: 'POST', body: JSON.stringify({ reason }) });
export const retryCertificate = (id: string) => apiRequest<{ id: string; status: CertificateStatus }>(`/admin/certificates/${id}/retry`, { method: 'POST' });
