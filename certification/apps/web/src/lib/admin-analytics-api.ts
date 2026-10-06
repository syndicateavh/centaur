import { apiRequest } from './auth-api.js';

export interface PageResult<T> { items: T[]; page: number; pageSize: number; total: number }
export interface AnalyticsOverview {
  generatedAt: string; activeLearnerWindowDays: number; users: number; enrollments: number;
  activeLearners: number; publishedCourses: number; completions: number; certificates: number; validCertificates: number;
}
export interface StudentRow { id: string; displayName: string | null; email: string; createdAt: string; enrollmentCount: number; completionCount: number; lastActiveAt: string | null }
export interface CourseAnalyticsRow { id: string; title: string; slug: string; status: string; certificateEnabled: boolean; quizRequired: boolean; createdAt: string; updatedAt: string; enrollmentCount: number; completionCount: number; lessonCount: number }
export interface CertificateSummary { id: string; publicCertificateId: string; status: string; issuedAt: string | null; revokedAt: string | null }
export interface StudentCourseRow {
  enrollmentId: string; courseId: string; title: string; slug: string; status: string; enrolledAt: string;
  lastAccessedAt: string | null; completedAt: string | null; quizRequired: boolean; requiredLessonCount: number;
  completedRequiredLessonCount: number; progressPercent: number; quizPassed: boolean; certificate: CertificateSummary | null;
}
export interface CourseLearnerRow {
  userId: string; displayName: string | null; email: string; enrollmentId: string; enrolledAt: string;
  lastAccessedAt: string | null; completedAt: string | null; requiredLessonCount: number;
  completedRequiredLessonCount: number; progressPercent: number; quizPassed: boolean; certificate: CertificateSummary | null;
}
export interface ActivityEvent { id: string; type: string; title: string; subject: string; occurredAt: string }
export interface CertificateAuditRow {
  id: string; certificateId: string; action: string; reason: string | null; createdAt: string; actorEmail: string | null;
  publicCertificateId: string; certificateStatus: string; learnerName: string; courseTitle: string;
}

function queryString(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) if (value !== undefined && value !== '') params.set(key, String(value));
  return params.toString();
}

export const getAdminAnalyticsOverview = () => apiRequest<AnalyticsOverview>('/admin/analytics/overview');
export const getAdminRecentActivity = () => apiRequest<ActivityEvent[]>('/admin/analytics/activity');
export const listAdminStudents = (input: { q?: string; activity?: string; page: number }) => apiRequest<PageResult<StudentRow>>(`/admin/analytics/students?${queryString({ ...input, pageSize: 25 })}`);
export const getAdminStudent = (id: string, page: number) => apiRequest<{ student: { id: string; displayName: string | null; email: string; createdAt: string }; courses: PageResult<StudentCourseRow> }>(`/admin/analytics/students/${id}?${queryString({ page, pageSize: 20 })}`);
export const listAdminCourseAnalytics = (input: { q?: string; status?: string; page: number }) => apiRequest<PageResult<CourseAnalyticsRow>>(`/admin/analytics/courses?${queryString({ ...input, pageSize: 25 })}`);
export const getAdminCourseAnalytics = (id: string, page: number) => apiRequest<{ course: { id: string; title: string; slug: string; status: string; description: string | null; certificateEnabled: boolean; quizRequired: boolean; createdAt: string; updatedAt: string }; learners: PageResult<CourseLearnerRow> }>(`/admin/analytics/courses/${id}?${queryString({ page, pageSize: 25 })}`);
export const listAdminCertificateAudit = (input: { q?: string; action?: string; page: number }) => apiRequest<PageResult<CertificateAuditRow>>(`/admin/audit/certificates?${queryString({ ...input, pageSize: 25 })}`);
