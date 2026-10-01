"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireCourseEditor } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

const courseSlug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const uuid = z.string().uuid();
const reviewSchema = z.object({ versionId: uuid, decision: z.enum(["approved", "changes_requested"]), notes: z.string().trim().min(10).max(10000) });
const questionSchema = z.object({
  text: z.string().trim().min(10).max(2000), objective: z.string().trim().min(2).max(300), lessonSlug: courseSlug,
  choices: z.array(z.object({ id: z.string().regex(/^[a-z0-9_-]{1,32}$/), text: z.string().trim().min(1).max(500) })).min(2).max(8),
  answerChoiceId: z.string().regex(/^[a-z0-9_-]{1,32}$/), explanation: z.string().trim().min(5).max(2000),
}).superRefine((question, context) => {
  const ids = question.choices.map((choice) => choice.id);
  if (new Set(ids).size !== ids.length || !ids.includes(question.answerChoiceId)) context.addIssue({ code: "custom", message: "Each choice ID must be unique and the answer must refer to one of them." });
});
const assessmentSchema = z.object({
  slug: courseSlug, title: z.string().trim().min(3).max(200), kind: z.enum(["knowledge_check", "final"]),
  moduleSlug: courseSlug.nullable().optional(), passPercent: z.number().min(1).max(100).nullable().optional(),
  maxAttempts: z.number().int().min(1).max(20), timeLimitMinutes: z.number().int().positive().max(240).nullable().optional(),
  questions: z.array(questionSchema).min(1).max(100),
}).superRefine((assessment, context) => {
  if (assessment.kind === "final" && (assessment.passPercent == null || assessment.moduleSlug)) context.addIssue({ code: "custom", message: "Final assessments need a pass score and cannot be scoped to one module." });
  if (assessment.kind === "knowledge_check" && !assessment.moduleSlug) context.addIssue({ code: "custom", message: "Knowledge checks need a module slug." });
});
const lessonBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.enum(["lead", "paragraph", "heading"]), text: z.string().trim().min(1).max(12000) }),
  z.object({ type: z.enum(["list", "takeaways"]), items: z.array(z.string().trim().min(1).max(2000)).min(1).max(50) }),
  z.object({ type: z.enum(["activity", "callout"]), title: z.string().trim().min(1).max(200), text: z.string().trim().min(1).max(5000) }),
]);
const lessonContentSchema = z.object({ minutes: z.number().int().min(1).max(600), blocks: z.array(lessonBlockSchema).min(1).max(100) });

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([key,item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

function audit(client: import("pg").PoolClient, actorId: string, action: string, targetType: string, targetId: string, details: Record<string, unknown> = {}) {
  return client.query(`INSERT INTO lms.audit_events(actor_user_id,action,target_type,target_id,details)
    VALUES($1,$2,$3,$4,$5::jsonb)`, [actorId, action, targetType, targetId, JSON.stringify(details)]);
}

export async function createCourseDraft(formData: FormData) {
  const editor = await requireCourseEditor();
  const input = z.object({ slug: courseSlug, title: z.string().trim().min(3).max(200), summary: z.string().trim().min(10).max(2000) })
    .parse({ slug: formData.get("slug"), title: formData.get("title"), summary: formData.get("summary") });
  const result = await withLearnerTransaction(editor.id, async (client) => {
    const course = await client.query<{ id: string }>(`INSERT INTO lms.courses(slug,title,summary,status,is_sandbox)
      VALUES($1,$2,$3,'draft',FALSE) RETURNING id`, [input.slug,input.title,input.summary]);
    const version = await client.query<{ id: string }>(`INSERT INTO lms.course_versions(course_id,version_number,status,overview)
      VALUES($1,1,'draft',$2) RETURNING id`, [course.rows[0].id,input.summary]);
    await client.query("UPDATE lms.courses SET current_version_id=$2 WHERE id=$1", [course.rows[0].id,version.rows[0].id]);
    await audit(client,editor.id,"course.draft_created","course",course.rows[0].id,{slug:input.slug});
    return version.rows[0].id;
  });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${result}&created=1`);
}

export async function createDraftVersion(formData: FormData) {
  const editor = await requireCourseEditor();
  const courseId = uuid.parse(formData.get("courseId"));
  const versionId = await withLearnerTransaction(editor.id, async (client) => {
    const source = await client.query<Record<string, unknown> & { id: string; course_id: string; is_sandbox: boolean; slug: string; version_number: number }>(`SELECT v.*,c.is_sandbox,c.slug
      FROM lms.courses c JOIN lms.course_versions v ON v.id=c.current_version_id
      WHERE c.id=$1 AND c.is_sandbox=FALSE AND v.status IN ('published','retired') FOR UPDATE OF c`, [courseId]);
    const previous = source.rows[0];
    if (!previous) return null;
    const sequence = await client.query<{ next_version: number }>("SELECT COALESCE(max(version_number),0)+1 AS next_version FROM lms.course_versions WHERE course_id=$1", [courseId]);
    const inserted = await client.query<{ id: string }>(`INSERT INTO lms.course_versions
      (course_id,version_number,status,overview,estimated_minutes,independent_practice_minutes,review_status,learning_objectives,glossary,content_sources,case_packet)
      VALUES($1,$2,'draft',$3,$4,$5,'pending',$6::jsonb,$7::jsonb,$8::jsonb,$9::jsonb) RETURNING id`,
    [courseId,sequence.rows[0].next_version,previous.overview,previous.estimated_minutes,previous.independent_practice_minutes,
      JSON.stringify(previous.learning_objectives),JSON.stringify(previous.glossary),JSON.stringify(previous.content_sources),JSON.stringify(previous.case_packet)]);
    const nextId = inserted.rows[0].id;
    const oldModules = await client.query<{ id: string; slug: string; title: string; summary: string; position: number }>("SELECT id,slug,title,summary,position FROM lms.modules WHERE course_version_id=$1 ORDER BY position", [previous.id]);
    for (const courseModule of oldModules.rows) {
      const createdModule = await client.query<{ id: string }>("INSERT INTO lms.modules(course_version_id,slug,title,summary,position) VALUES($1,$2,$3,$4,$5) RETURNING id", [nextId,courseModule.slug,courseModule.title,courseModule.summary,courseModule.position]);
      const lessons = await client.query<{ slug: string; title: string; format: string; content: unknown; position: number }>("SELECT slug,title,format,content,position FROM lms.lessons WHERE module_id=$1 ORDER BY position", [courseModule.id]);
      for (const lesson of lessons.rows) await client.query(`INSERT INTO lms.lessons(module_id,slug,title,format,content,position,published)
        VALUES($1,$2,$3,$4,$5::jsonb,$6,FALSE)`, [createdModule.rows[0].id,lesson.slug,lesson.title,lesson.format,JSON.stringify(lesson.content),lesson.position]);
    }
    const oldAssessments = await client.query<{ id: string; slug: string; title: string; version_number: number; pass_percent: string | number | null; rules: unknown; content_hash: string }>("SELECT id,slug,title,version_number,pass_percent,rules,content_hash FROM lms.assessments WHERE course_version_id=$1 ORDER BY slug,version_number", [previous.id]);
    for (const assessment of oldAssessments.rows) {
      const createdAssessment = await client.query<{ id: string }>(`INSERT INTO lms.assessments(course_version_id,slug,title,version_number,status,pass_percent,rules,review_status,content_hash)
        VALUES($1,$2,$3,$4,'draft',$5,$6::jsonb,'pending',$7) RETURNING id`, [nextId,assessment.slug,assessment.title,assessment.version_number,assessment.pass_percent,JSON.stringify(assessment.rules),assessment.content_hash]);
      const questions = await client.query<{ position: number; question_type: string; prompt: unknown; choices: unknown; answer_key: unknown; explanation: unknown }>("SELECT position,question_type,prompt,choices,answer_key,explanation FROM lms.assessment_questions WHERE assessment_id=$1 ORDER BY position", [assessment.id]);
      for (const question of questions.rows) await client.query(`INSERT INTO lms.assessment_questions(assessment_id,position,question_type,prompt,choices,answer_key,explanation)
        VALUES($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb)`, [createdAssessment.rows[0].id,question.position,question.question_type,JSON.stringify(question.prompt),JSON.stringify(question.choices),JSON.stringify(question.answer_key),JSON.stringify(question.explanation)]);
    }
    await client.query("UPDATE lms.courses SET current_version_id=$2,updated_at=now() WHERE id=$1", [courseId,nextId]);
    await audit(client,editor.id,"course.version_drafted","course_version",nextId,{course_id:courseId,source_version_id:previous.id,version_number:sequence.rows[0].next_version});
    return nextId;
  });
  if (!versionId) redirect("/admin/courses?state=version-source-required");
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${versionId}&versioned=1`);
}

export async function updateCourseVersionMetadata(formData: FormData) {
  const editor = await requireCourseEditor();
  const input = z.object({ versionId: uuid, overview: z.string().trim().min(20).max(10000), estimatedMinutes: z.coerce.number().int().min(1).max(100000), practiceMinutes: z.coerce.number().int().min(0).max(100000), objectives: z.string().min(2).max(10000), sources: z.string().min(5).max(20000) })
    .parse({ versionId:formData.get("versionId"),overview:formData.get("overview"),estimatedMinutes:formData.get("estimatedMinutes"),practiceMinutes:formData.get("practiceMinutes"),objectives:formData.get("objectives"),sources:formData.get("sources") });
  const objectives = input.objectives.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  const sourceLines = input.sources.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const sourceParts = sourceLines.map((line) => line.split("|").map((part) => part.trim()));
  const sources = sourceParts.filter((parts) => parts.length >= 3 && parts[0] && parts[1] && parts[2]).map(([title,url,note]) => ({title,url,note,accessed:new Date().toISOString().slice(0,10)}));
  if (!objectives.length || !sources.length || sources.length!==sourceLines.length || sources.some((source) => {
    try { return new URL(source.url).protocol!=="https:"; } catch { return true; }
  })) redirect(`/admin/courses?version=${input.versionId}&state=metadata-invalid`);
  await withLearnerTransaction(editor.id,async (client) => {
    const changed = await client.query(`UPDATE lms.course_versions SET overview=$2,estimated_minutes=$3,independent_practice_minutes=$4,
      learning_objectives=$5::jsonb,content_sources=$6::jsonb,updated_at=now() WHERE id=$1 AND status='draft'`, [input.versionId,input.overview,input.estimatedMinutes,input.practiceMinutes,JSON.stringify(objectives),JSON.stringify(sources)]);
    if (!changed.rowCount) return false;
    await audit(client,editor.id,"course.version_metadata_updated","course_version",input.versionId);
    return true;
  });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${input.versionId}&saved=1`);
}

export async function addModuleToDraft(formData: FormData) {
  const editor = await requireCourseEditor();
  const input = z.object({versionId:uuid,slug:courseSlug,title:z.string().trim().min(3).max(200),summary:z.string().trim().min(10).max(2000)})
    .parse({versionId:formData.get("versionId"),slug:formData.get("slug"),title:formData.get("title"),summary:formData.get("summary")});
  await withLearnerTransaction(editor.id,async (client) => {
    const version = await client.query("SELECT id FROM lms.course_versions WHERE id=$1 AND status='draft' FOR UPDATE",[input.versionId]);
    if (!version.rowCount) return;
    const position = await client.query<{ next_position:number }>("SELECT COALESCE(max(position),0)+1 AS next_position FROM lms.modules WHERE course_version_id=$1",[input.versionId]);
    const created = await client.query<{id:string}>("INSERT INTO lms.modules(course_version_id,slug,title,summary,position) VALUES($1,$2,$3,$4,$5) RETURNING id",[input.versionId,input.slug,input.title,input.summary,position.rows[0].next_position]);
    await audit(client,editor.id,"course.module_created","module",created.rows[0].id,{version_id:input.versionId});
  });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${input.versionId}&saved=1`);
}

export async function addLessonToDraft(formData: FormData) {
  const editor = await requireCourseEditor();
  const input = z.object({moduleId:uuid,slug:courseSlug,title:z.string().trim().min(3).max(200),minutes:z.coerce.number().int().min(1).max(600),lead:z.string().trim().min(10).max(1500),body:z.string().trim().min(20).max(12000)})
    .parse({moduleId:formData.get("moduleId"),slug:formData.get("slug"),title:formData.get("title"),minutes:formData.get("minutes"),lead:formData.get("lead"),body:formData.get("body")});
  const versionId = await withLearnerTransaction(editor.id,async (client) => {
    const moduleResult = await client.query<{version_id:string}>("SELECT course_version_id AS version_id FROM lms.modules m JOIN lms.course_versions v ON v.id=m.course_version_id WHERE m.id=$1 AND v.status='draft' FOR UPDATE OF v",[input.moduleId]);
    if (!moduleResult.rowCount) return null;
    const position = await client.query<{next_position:number}>("SELECT COALESCE(max(position),0)+1 AS next_position FROM lms.lessons WHERE module_id=$1",[input.moduleId]);
    const content = {minutes:input.minutes,blocks:[{type:"lead",text:input.lead},...input.body.split(/\r?\n\s*\r?\n/).map((text) => text.trim()).filter(Boolean).map((text) => ({type:"paragraph",text}))]};
    const lesson = await client.query<{id:string}>("INSERT INTO lms.lessons(module_id,slug,title,content,position,published) VALUES($1,$2,$3,$4::jsonb,$5,FALSE) RETURNING id",[input.moduleId,input.slug,input.title,JSON.stringify(content),position.rows[0].next_position]);
    await audit(client,editor.id,"course.lesson_created","lesson",lesson.rows[0].id,{version_id:moduleResult.rows[0].version_id});
    return moduleResult.rows[0].version_id;
  });
  revalidatePath("/admin/courses");
  redirect(versionId ? `/admin/courses?version=${versionId}&saved=1` : "/admin/courses?state=version-not-draft");
}

export async function updateModuleDraft(formData: FormData) {
  const editor = await requireCourseEditor();
  const input = z.object({ moduleId:uuid,title:z.string().trim().min(3).max(200),summary:z.string().trim().min(10).max(2000) })
    .parse({moduleId:formData.get("moduleId"),title:formData.get("title"),summary:formData.get("summary")});
  const versionId = await withLearnerTransaction(editor.id,async (client) => {
    const moduleRow = await client.query<{version_id:string}>(`SELECT m.course_version_id AS version_id FROM lms.modules m
      JOIN lms.course_versions v ON v.id=m.course_version_id WHERE m.id=$1 AND v.status='draft' FOR UPDATE OF v`,[input.moduleId]);
    if(!moduleRow.rowCount)return null;
    await client.query("UPDATE lms.modules SET title=$2,summary=$3,updated_at=now() WHERE id=$1",[input.moduleId,input.title,input.summary]);
    await audit(client,editor.id,"course.module_updated","module",input.moduleId,{version_id:moduleRow.rows[0].version_id});
    return moduleRow.rows[0].version_id;
  });
  if(!versionId)redirect("/admin/courses?state=version-not-draft");
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${versionId}&saved=1`);
}

export async function updateLessonDraft(formData: FormData) {
  const editor = await requireCourseEditor();
  const lessonId = uuid.parse(formData.get("lessonId"));
  const title = z.string().trim().min(3).max(200).parse(formData.get("title"));
  const raw = z.string().max(100000).parse(formData.get("contentJson"));
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { redirect("/admin/courses?state=lesson-json-invalid"); }
  const content = lessonContentSchema.safeParse(parsed);
  if(!content.success)redirect("/admin/courses?state=lesson-content-invalid");
  const versionId = await withLearnerTransaction(editor.id,async (client) => {
    const lesson = await client.query<{version_id:string}>(`SELECT m.course_version_id AS version_id FROM lms.lessons l
      JOIN lms.modules m ON m.id=l.module_id JOIN lms.course_versions v ON v.id=m.course_version_id
      WHERE l.id=$1 AND l.published=FALSE AND v.status='draft' FOR UPDATE OF v`,[lessonId]);
    if(!lesson.rowCount)return null;
    await client.query("UPDATE lms.lessons SET title=$2,content=$3::jsonb,updated_at=now() WHERE id=$1",[lessonId,title,JSON.stringify(content.data)]);
    await audit(client,editor.id,"course.lesson_updated","lesson",lessonId,{version_id:lesson.rows[0].version_id});
    return lesson.rows[0].version_id;
  });
  if(!versionId)redirect("/admin/courses?state=version-not-draft");
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${versionId}&saved=1`);
}

export async function createAssessmentDraft(formData: FormData) {
  const editor = await requireCourseEditor();
  const versionId = uuid.parse(formData.get("versionId"));
  const raw = z.string().max(200000).parse(formData.get("assessmentJson"));
  let parsedJson: unknown;
  try { parsedJson = JSON.parse(raw); } catch { redirect(`/admin/courses?version=${versionId}&state=assessment-json-invalid`); }
  const parsedAssessment = assessmentSchema.safeParse(parsedJson);
  if (!parsedAssessment.success) redirect(`/admin/courses?version=${versionId}&state=assessment-json-invalid`);
  const input = parsedAssessment.data;
  const objectiveBlueprint = [...new Set(input.questions.map((question) => question.objective))].map((objective) => ({objective,count:input.questions.filter((question) => question.objective===objective).length}));
  const rules = {kind:input.kind,module_slug:input.moduleSlug ?? null,max_attempts:input.maxAttempts,time_limit_minutes:input.timeLimitMinutes ?? null,question_count:input.questions.length,objective_blueprint:objectiveBlueprint,feedback:input.kind==="final"?"objective_summary_without_answer_key":"answer_explanations"};
  const hash = createHash("sha256").update(stable(input)).digest("hex");
  const createdId = await withLearnerTransaction(editor.id,async (client) => {
    const version = await client.query("SELECT id FROM lms.course_versions WHERE id=$1 AND status='draft' FOR UPDATE",[versionId]);
    if (!version.rowCount) return null;
    if(input.moduleSlug){
      const moduleExists=await client.query("SELECT 1 FROM lms.modules WHERE course_version_id=$1 AND slug=$2",[versionId,input.moduleSlug]);
      if(!moduleExists.rowCount)return null;
    }
    const lessonSlugs=[...new Set(input.questions.map((question)=>question.lessonSlug))];
    const lessonRows=await client.query("SELECT DISTINCT l.slug FROM lms.lessons l JOIN lms.modules m ON m.id=l.module_id WHERE m.course_version_id=$1 AND l.slug=ANY($2::text[])",[versionId,lessonSlugs]);
    if(lessonRows.rowCount!==lessonSlugs.length)return null;
    const sequence = await client.query<{version_number:number}>("SELECT COALESCE(max(version_number),0)+1 AS version_number FROM lms.assessments WHERE course_version_id=$1 AND slug=$2",[versionId,input.slug]);
    const assessment = await client.query<{id:string}>(`INSERT INTO lms.assessments(course_version_id,slug,title,version_number,status,pass_percent,rules,review_status,content_hash)
      VALUES($1,$2,$3,$4,'draft',$5,$6::jsonb,'pending',$7) RETURNING id`,[versionId,input.slug,input.title,sequence.rows[0].version_number,input.kind==="final"?input.passPercent:null,JSON.stringify(rules),hash]);
    for (const [index,question] of input.questions.entries()) await client.query(`INSERT INTO lms.assessment_questions(assessment_id,position,question_type,prompt,choices,answer_key,explanation)
      VALUES($1,$2,'single_choice',$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb)`,[assessment.rows[0].id,index+1,
      JSON.stringify({text:question.text,objective:question.objective,lesson_slug:question.lessonSlug}),JSON.stringify(question.choices),JSON.stringify({choice_id:question.answerChoiceId}),JSON.stringify({text:question.explanation})]);
    await audit(client,editor.id,"assessment.draft_created","assessment",assessment.rows[0].id,{version_id:versionId,version_number:sequence.rows[0].version_number,question_count:input.questions.length});
    return assessment.rows[0].id;
  });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${versionId}&${createdId?"assessmentCreated=1":"state=version-not-draft"}`);
}

export async function updateAssessmentDraft(formData: FormData) {
  const editor = await requireCourseEditor();
  const assessmentId = uuid.parse(formData.get("assessmentId"));
  const raw = z.string().max(200000).parse(formData.get("assessmentJson"));
  let parsedJson: unknown;
  try { parsedJson = JSON.parse(raw); } catch { redirect("/admin/courses?state=assessment-json-invalid"); }
  const parsedAssessment = assessmentSchema.safeParse(parsedJson);
  if(!parsedAssessment.success)redirect("/admin/courses?state=assessment-json-invalid");
  const input = parsedAssessment.data;
  const hash = createHash("sha256").update(stable(input)).digest("hex");
  const versionId = await withLearnerTransaction(editor.id,async (client) => {
    const existing = await client.query<{version_id:string;slug:string}>(`SELECT course_version_id AS version_id,slug FROM lms.assessments
      WHERE id=$1 AND status='draft' FOR UPDATE`,[assessmentId]);
    if(!existing.rowCount || existing.rows[0].slug!==input.slug)return null;
    const [attempts,reviews] = await Promise.all([
      client.query<{total:number}>("SELECT count(*)::int AS total FROM lms.assessment_attempts WHERE assessment_id=$1",[assessmentId]),
      client.query<{total:number}>("SELECT count(*)::int AS total FROM lms.assessment_reviews WHERE assessment_id=$1",[assessmentId]),
    ]);
    if(attempts.rows[0].total>0 || reviews.rows[0].total>0)return null;
    if(input.moduleSlug){
      const moduleExists=await client.query("SELECT 1 FROM lms.modules WHERE course_version_id=$1 AND slug=$2",[existing.rows[0].version_id,input.moduleSlug]);
      if(!moduleExists.rowCount)return null;
    }
    const lessonSlugs=[...new Set(input.questions.map((question)=>question.lessonSlug))];
    const lessonRows=await client.query("SELECT DISTINCT l.slug FROM lms.lessons l JOIN lms.modules m ON m.id=l.module_id WHERE m.course_version_id=$1 AND l.slug=ANY($2::text[])",[existing.rows[0].version_id,lessonSlugs]);
    if(lessonRows.rowCount!==lessonSlugs.length)return null;
    const objectiveBlueprint=[...new Set(input.questions.map((question)=>question.objective))].map((objective)=>({objective,count:input.questions.filter((question)=>question.objective===objective).length}));
    const rules={kind:input.kind,module_slug:input.moduleSlug??null,max_attempts:input.maxAttempts,time_limit_minutes:input.timeLimitMinutes??null,question_count:input.questions.length,objective_blueprint:objectiveBlueprint,feedback:input.kind==="final"?"objective_summary_without_answer_key":"answer_explanations"};
    await client.query("DELETE FROM lms.assessment_questions WHERE assessment_id=$1",[assessmentId]);
    await client.query(`UPDATE lms.assessments SET title=$2,pass_percent=$3,rules=$4::jsonb,review_status='pending',review_date=NULL,reviewer_name=NULL,content_hash=$5,updated_at=now() WHERE id=$1`,
      [assessmentId,input.title,input.kind==="final"?input.passPercent:null,JSON.stringify(rules),hash]);
    for(const [index,question] of input.questions.entries())await client.query(`INSERT INTO lms.assessment_questions
      (assessment_id,position,question_type,prompt,choices,answer_key,explanation)
      VALUES($1,$2,'single_choice',$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb)`,[assessmentId,index+1,
      JSON.stringify({text:question.text,objective:question.objective,lesson_slug:question.lessonSlug}),JSON.stringify(question.choices),JSON.stringify({choice_id:question.answerChoiceId}),JSON.stringify({text:question.explanation})]);
    await audit(client,editor.id,"assessment.draft_updated","assessment",assessmentId,{version_id:existing.rows[0].version_id,question_count:input.questions.length});
    return existing.rows[0].version_id;
  });
  if(!versionId)redirect("/admin/courses?state=assessment-version-required");
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${versionId}&saved=1`);
}

export async function reviewCourseVersion(formData: FormData) {
  const reviewer = await requireCourseEditor();
  const input = reviewSchema.parse({versionId:formData.get("versionId"),decision:formData.get("decision"),notes:formData.get("notes")});
  await withLearnerTransaction(reviewer.id,async (client) => {
    const version = await client.query<{reviewer_name:string}>(`SELECT COALESCE(p.display_name,u.name) AS reviewer_name FROM lms.course_versions v
      JOIN lms.courses c ON c.id=v.course_id JOIN lms."user" u ON u.id=$2 LEFT JOIN lms.profiles p ON p.user_id=u.id
      WHERE v.id=$1 AND v.status='draft' AND c.is_sandbox=FALSE FOR UPDATE OF v`,[input.versionId,reviewer.id]);
    if (!version.rowCount) return;
    await client.query("INSERT INTO lms.course_version_reviews(course_version_id,reviewer_user_id,reviewer_name,decision,notes) VALUES($1,$2,$3,$4,$5)",[input.versionId,reviewer.id,version.rows[0].reviewer_name,input.decision,input.notes]);
    await client.query("UPDATE lms.course_versions SET review_status=$2,review_date=CURRENT_DATE,reviewer_name=$3,updated_at=now() WHERE id=$1",[input.versionId,input.decision,version.rows[0].reviewer_name]);
    await audit(client,reviewer.id,`course.review_${input.decision}`,"course_version",input.versionId);
  });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${input.versionId}&reviewed=1`);
}

export async function reviewAssessment(formData: FormData) {
  const reviewer = await requireCourseEditor();
  const input = z.object({assessmentId:uuid,decision:z.enum(["approved","changes_requested"]),notes:z.string().trim().min(10).max(10000)}).parse({assessmentId:formData.get("assessmentId"),decision:formData.get("decision"),notes:formData.get("notes")});
  await withLearnerTransaction(reviewer.id,async (client) => {
    const assessment = await client.query<{version_number:number;version_id:string;reviewer_name:string}>(`SELECT a.version_number,a.course_version_id AS version_id,COALESCE(p.display_name,u.name) AS reviewer_name
      FROM lms.assessments a JOIN lms.course_versions v ON v.id=a.course_version_id JOIN lms.courses c ON c.id=v.course_id
      JOIN lms."user" u ON u.id=$2 LEFT JOIN lms.profiles p ON p.user_id=u.id
      WHERE a.id=$1 AND a.status='draft' AND v.status='draft' AND c.is_sandbox=FALSE FOR UPDATE OF a`,[input.assessmentId,reviewer.id]);
    if (!assessment.rowCount) return null;
    await client.query(`INSERT INTO lms.assessment_reviews(assessment_id,assessment_version_number,reviewer_name,reviewer_user_id,decision,notes)
      VALUES($1,$2,$3,$4,$5,$6)`,[input.assessmentId,assessment.rows[0].version_number,assessment.rows[0].reviewer_name,reviewer.id,input.decision,input.notes]);
    await client.query("UPDATE lms.assessments SET review_status=$2,review_date=CURRENT_DATE,reviewer_name=$3,updated_at=now() WHERE id=$1",[input.assessmentId,input.decision,assessment.rows[0].reviewer_name]);
    await audit(client,reviewer.id,`assessment.review_${input.decision}`,"assessment",input.assessmentId,{assessment_version:assessment.rows[0].version_number});
    return assessment.rows[0].version_id;
  });
  revalidatePath("/admin/courses");
  redirect("/admin/courses?reviewed=1");
}

export async function scheduleCourseVersion(formData: FormData) {
  const editor = await requireCourseEditor();
  const input = z.object({versionId:uuid,scheduledAt:z.string().datetime({offset:true})}).parse({versionId:formData.get("versionId"),scheduledAt:formData.get("scheduledAt")});
  const scheduled = new Date(input.scheduledAt);
  if (scheduled.getTime()<Date.now()+5*60*1000) redirect(`/admin/courses?version=${input.versionId}&state=schedule-too-soon`);
  await withLearnerTransaction(editor.id,async (client) => {
    const result = await client.query<{course_id:string}>(`UPDATE lms.course_versions cv SET scheduled_publish_at=$2,updated_at=now()
      WHERE cv.id=$1 AND cv.status='draft' AND cv.review_status='approved'
        AND EXISTS(SELECT 1 FROM lms.courses c WHERE c.id=cv.course_id AND c.is_sandbox=FALSE)
      RETURNING cv.course_id`,[input.versionId,scheduled]);
    if (result.rowCount) await audit(client,editor.id,"course.publication_scheduled","course_version",input.versionId,{scheduled_at:scheduled.toISOString()});
  });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses?version=${input.versionId}&scheduled=1`);
}

export async function publishCourseVersionNow(formData: FormData) {
  const editor = await requireCourseEditor();
  const versionId = uuid.parse(formData.get("versionId"));
  await withLearnerTransaction(editor.id,async (client) => client.query("SELECT lms.publish_course_version($1,$2,TRUE)",[versionId,editor.id]));
  revalidatePath("/admin/courses");
  revalidatePath("/dashboard");
  redirect("/admin/courses?published=1");
}

export async function retireCourseVersion(formData: FormData) {
  const admin = await requireAdmin();
  const input = z.object({versionId:uuid,reason:z.string().trim().min(10).max(1000)}).parse({versionId:formData.get("versionId"),reason:formData.get("reason")});
  await withLearnerTransaction(admin.id,async (client) => client.query("SELECT lms.retire_course_version($1,$2,$3)",[input.versionId,admin.id,input.reason]));
  revalidatePath("/admin/courses");
  revalidatePath("/dashboard");
  redirect("/admin/courses?retired=1");
}
