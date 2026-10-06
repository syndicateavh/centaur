import { apiRequest } from './auth-api.js';
import type { SessionUser } from '@centaur/lms-shared';

export type CourseStatus = 'draft' | 'published' | 'archived';
export type LessonType = 'VIDEO' | 'PDF' | 'TEXT';

export interface LessonRecord {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  type: LessonType;
  content: string | null;
  required: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModuleRecord {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  lessons: LessonRecord[];
}

export interface CourseRecord {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: CourseStatus;
  certificateEnabled: boolean;
  quizEnabled: boolean;
  quizRequired: boolean;
  quizPassPercent: number;
  videoCompletionPercent: number;
  textCompletionMode: 'manual' | 'on_open';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  archivedAt: string | null;
  modules: CourseModuleRecord[];
}

export interface EnrolledCourseSummary {
  enrollmentId: string;
  enrolledAt: string;
  lastAccessedLessonId: string | null;
  lastAccessedAt: string | null;
  id: string;
  slug: string;
  title: string;
  description: string | null;
  certificateEnabled: boolean;
  quizEnabled: boolean;
  quizRequired: boolean;
  continueLessonId: string | null;
  lessonCount: number;
  requiredLessonCount: number;
  completedRequiredLessonCount: number;
  progressPercent: number;
  isCompleted: boolean;
  completionBlockedByQuiz: boolean;
  completedAt: string | null;
}

export interface EnrolledCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  certificateEnabled: boolean;
  quizEnabled: boolean;
  quizRequired: boolean;
  enrolledAt: string;
  lastAccessedAt: string | null;
  currentLessonId: string | null;
  lessonCount: number;
  requiredLessonCount: number;
  completedRequiredLessonCount: number;
  progressPercent: number;
  isCompleted: boolean;
  completionBlockedByQuiz: boolean;
  completedAt: string | null;
  modules: Array<Pick<CourseModuleRecord, 'id' | 'title' | 'description' | 'sortOrder'> & {
    lessons: Array<Pick<LessonRecord, 'id' | 'title' | 'description' | 'type' | 'required' | 'sortOrder'> & {
      progressStatus: 'not_started' | 'in_progress' | 'completed' | null;
      lastPositionSeconds: number | null;
      completedAt: string | null;
    }>;
  }>;
}

export interface LearnerLesson {
  id: string;
  title: string;
  description: string | null;
  type: LessonType;
  content: string | null;
  required: boolean;
  sortOrder: number;
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  accessedAt: string;
  progress: LessonProgress | null;
}

export interface LessonProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  lastPositionSeconds: number;
  durationSeconds: number | null;
  watchedSeconds: number;
  progressPercent: number;
  completionThresholdPercent: number;
  completedAt: string | null;
}

export interface CourseProgressSummary {
  lessonCount: number;
  requiredLessonCount: number;
  completedRequiredLessonCount: number;
  progressPercent: number;
  isCompleted: boolean;
  completionBlockedByQuiz: boolean;
}

export type QuizQuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface QuizOptionDraft { label: string; isCorrect: boolean }
export interface QuizQuestionDraft { prompt: string; type: QuizQuestionType; points: number; options: QuizOptionDraft[] }
export interface QuizDraft { title: string; description: string | null; questions: QuizQuestionDraft[] }
export interface AdminQuizResponse {
  enabled: boolean;
  editingLocked: boolean;
  quiz: (QuizDraft & { id: string; courseId: string; updatedAt: string; questions: Array<QuizQuestionDraft & { id: string; sortOrder: number; options: Array<QuizOptionDraft & { id: string; sortOrder: number }> }> }) | null;
}
export interface LearnerQuiz {
  id: string;
  title: string;
  description: string | null;
  passPercent: number;
  questions: Array<{ id: string; prompt: string; type: QuizQuestionType; points: number; sortOrder: number; options: Array<{ id: string; label: string; sortOrder: number }> }>;
  attempts: Array<{ id: string; scorePercent: number; passed: boolean; submittedAt: string }>;
  hasPassed: boolean;
  attemptPolicy: 'unlimited';
}
export interface QuizSubmission {
  answers: Array<{ questionId: string; optionIds: string[] }>;
}
export interface QuizAttemptResult {
  attempt: { id: string; submittedAt: string; earnedPoints: number; totalPoints: number; scorePercent: number; passed: boolean; passPercent: number };
  answers: Array<{ questionId: string; isCorrect: boolean; selectedOptionIds: string[]; correctOptionIds: string[] }>;
}

export interface MediaAssetSummary {
  id: string;
  lessonId: string;
  kind: 'VIDEO' | 'PDF';
  status: 'uploading' | 'processing' | 'ready' | 'failed' | 'aborted';
  originalFileName: string;
  contentType: string;
  sourceSizeBytes: number;
  outputSizeBytes: number | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  errorCode: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}

export interface LessonPlaybackMedia {
  id: string;
  kind: 'VIDEO' | 'PDF';
  url: string;
  expiresInSeconds: number;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  posterUrl?: string | null;
}

export type PublicCourse = Pick<CourseRecord, 'id' | 'slug' | 'title' | 'description' | 'certificateEnabled'> & {
  publishedAt: string | null;
  quizEnabled?: boolean;
  quizRequired?: boolean;
  modules: Array<Pick<CourseModuleRecord, 'id' | 'title' | 'description' | 'sortOrder'> & {
    lessons: Array<Pick<LessonRecord, 'id' | 'title' | 'description' | 'type' | 'required' | 'sortOrder'>>;
  }>;
};

export type CourseInput = Pick<CourseRecord, 'title' | 'slug' | 'description' | 'certificateEnabled' | 'quizEnabled' | 'quizRequired' | 'quizPassPercent' | 'videoCompletionPercent' | 'textCompletionMode'>;
export type ModuleInput = Pick<CourseModuleRecord, 'title' | 'description'>;
export type LessonInput = Pick<LessonRecord, 'title' | 'description' | 'type' | 'content' | 'required'>;

export const listCourses = () => apiRequest<Array<Pick<PublicCourse, 'id' | 'slug' | 'title' | 'description' | 'certificateEnabled' | 'publishedAt'>>>('/courses');
export const getPublishedCourse = (slug: string) => apiRequest<PublicCourse>(`/courses/${encodeURIComponent(slug)}`);
export const listAdminCourses = (input: { q?: string; status?: string; page: number }) => {
  const params = new URLSearchParams({ page: String(input.page), pageSize: '25' });
  if (input.q) params.set('q', input.q);
  if (input.status) params.set('status', input.status);
  return apiRequest<{ items: CourseRecord[]; page: number; pageSize: number; total: number }>(`/admin/courses?${params}`);
};
export const getAdminCourse = (id: string) => apiRequest<CourseRecord>(`/admin/courses/${id}`);
export const listMyCourses = () => apiRequest<EnrolledCourseSummary[]>('/learner/courses');
export const enrollInCourse = (id: string) => apiRequest<{ enrollment: { id: string; enrolledAt: string } }>(`/learner/courses/${id}/enrollment`, { method: 'POST' });
export const getEnrolledCourse = (id: string) => apiRequest<EnrolledCourse>(`/learner/courses/${id}`);
export const openLearnerLesson = (courseId: string, lessonId: string) => apiRequest<LearnerLesson>(`/learner/courses/${courseId}/lessons/${lessonId}`);
export const getLessonProgress = (courseId: string, lessonId: string) => apiRequest<LessonProgress>(`/learner/courses/${courseId}/lessons/${lessonId}/progress`);
export const recordVideoProgress = (courseId: string, lessonId: string, fromPositionSeconds: number, positionSeconds: number) => apiRequest<LessonProgress>(`/learner/courses/${courseId}/lessons/${lessonId}/progress/video`, { method: 'POST', body: JSON.stringify({ fromPositionSeconds, positionSeconds }) });
export const markLessonComplete = (courseId: string, lessonId: string) => apiRequest<LessonProgress>(`/learner/courses/${courseId}/lessons/${lessonId}/progress/complete`, { method: 'POST' });
export const getCourseProgress = (courseId: string) => apiRequest<CourseProgressSummary>(`/learner/courses/${courseId}/progress`);
export const getAdminQuiz = (courseId: string) => apiRequest<AdminQuizResponse>(`/admin/courses/${courseId}/quiz`);
export const saveAdminQuiz = (courseId: string, input: QuizDraft) => apiRequest<AdminQuizResponse>(`/admin/courses/${courseId}/quiz`, { method: 'PUT', body: JSON.stringify(input) });
export const getLearnerQuiz = (courseId: string) => apiRequest<LearnerQuiz>(`/learner/courses/${courseId}/quiz`);
export const submitLearnerQuiz = (courseId: string, input: QuizSubmission) => apiRequest<QuizAttemptResult>(`/learner/courses/${courseId}/quiz/attempts`, { method: 'POST', body: JSON.stringify(input) });
export const getLearnerProfile = () => apiRequest<SessionUser>('/learner/profile');
export const listLessonMedia = (lessonId: string) => apiRequest<MediaAssetSummary[]>(`/admin/media/lessons/${lessonId}`);
export const startMediaUpload = (input: { lessonId: string; fileName: string; contentType: string; sizeBytes: number }) => apiRequest<{ media: MediaAssetSummary; partSizeBytes: number }>('/admin/media/uploads', { method: 'POST', body: JSON.stringify(input) });
export const getMediaUploadPartUrl = (mediaId: string, partNumber: number) => apiRequest<{ url: string; expiresInSeconds: number }>(`/admin/media/uploads/${mediaId}/parts/${partNumber}`);
export const completeMediaUpload = (mediaId: string) => apiRequest<{ media: MediaAssetSummary; enqueued: boolean }>(`/admin/media/uploads/${mediaId}/complete`, { method: 'POST' });
export const abortMediaUpload = (mediaId: string) => apiRequest<{ media: MediaAssetSummary }>(`/admin/media/uploads/${mediaId}/abort`, { method: 'POST' });
export const retryMediaProcessing = (mediaId: string) => apiRequest<MediaAssetSummary>(`/admin/media/uploads/${mediaId}/retry`, { method: 'POST' });
export const getLessonPlaybackMedia = (courseId: string, lessonId: string) => apiRequest<LessonPlaybackMedia>(`/learner/courses/${courseId}/lessons/${lessonId}/media`);

export const createCourse = (input: CourseInput) => apiRequest<CourseRecord>('/admin/courses', { method: 'POST', body: JSON.stringify(input) });
export const updateCourse = (id: string, input: CourseInput) => apiRequest<CourseRecord>(`/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
export const changeCourseStatus = (id: string, status: CourseStatus) => apiRequest<CourseRecord>(`/admin/courses/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteCourse = (id: string) => apiRequest<{ ok: boolean }>(`/admin/courses/${id}`, { method: 'DELETE' });

export const createModule = (courseId: string, input: ModuleInput) => apiRequest<CourseRecord>(`/admin/courses/${courseId}/modules`, { method: 'POST', body: JSON.stringify(input) });
export const updateModule = (courseId: string, moduleId: string, input: ModuleInput) => apiRequest<CourseRecord>(`/admin/courses/${courseId}/modules/${moduleId}`, { method: 'PATCH', body: JSON.stringify(input) });
export const deleteModule = (courseId: string, moduleId: string) => apiRequest<CourseRecord>(`/admin/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' });
export const reorderModules = (courseId: string, ids: string[]) => apiRequest<CourseRecord>(`/admin/courses/${courseId}/modules/order`, { method: 'PUT', body: JSON.stringify({ ids }) });

export const createLesson = (courseId: string, moduleId: string, input: LessonInput) => apiRequest<CourseRecord>(`/admin/courses/${courseId}/modules/${moduleId}/lessons`, { method: 'POST', body: JSON.stringify(input) });
export const updateLesson = (courseId: string, moduleId: string, lessonId: string, input: LessonInput) => apiRequest<CourseRecord>(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, { method: 'PATCH', body: JSON.stringify(input) });
export const deleteLesson = (courseId: string, moduleId: string, lessonId: string) => apiRequest<CourseRecord>(`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, { method: 'DELETE' });
export const reorderLessons = (courseId: string, moduleId: string, ids: string[]) => apiRequest<CourseRecord>(`/admin/courses/${courseId}/modules/${moduleId}/lessons/order`, { method: 'PUT', body: JSON.stringify({ ids }) });
