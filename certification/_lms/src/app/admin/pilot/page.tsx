import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { requireAdmin } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";
import { invitePilotLearner } from "./actions";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Controlled pilot",robots:{index:false,follow:false}};

type Course={id:string;slug:string;title:string};
type Metrics={invited:number;redeemed:number;enrolled:number;active:number;completed:number;lessons_completed:number;submitted_attempts:number;passed_attempts:number;feedback_count:number;overall:number|null;clarity:number|null;confidence:number|null;open_support:number;certificates:number};
type Feedback={overall_rating:number;instruction_clarity:number;confidence_after:number|null;issue_categories:string[];comment:string;submitted_at:Date};

export default async function PilotPage({searchParams}:{searchParams:Promise<{course?:string;invited?:string;state?:string}>}){
  const admin=await requireAdmin();
  const params=await searchParams;
  const requested=z.string().uuid().safeParse(params.course);
  const data=await withLearnerTransaction(admin.id,async(client)=>{
    const courses=await client.query<Course>(`SELECT c.id,c.slug,c.title FROM lms.courses c JOIN lms.course_versions v ON v.id=c.current_version_id
      WHERE c.status='published' AND c.is_sandbox=FALSE AND v.status='published' AND v.review_status='approved' ORDER BY c.title`);
    const selected=courses.rows.find((course)=>course.id===requested.data)??courses.rows[0]??null;
    if(!selected)return {courses:courses.rows,selected:null,metrics:null,feedback:[] as Feedback[]};
    const [metrics,feedback]=await Promise.all([
      client.query<Metrics>(`SELECT
        (SELECT count(*)::int FROM lms.pilot_course_invites WHERE course_id=$1 AND expires_at>now() AND redeemed_at IS NULL) AS invited,
        (SELECT count(*)::int FROM lms.pilot_course_invites WHERE course_id=$1 AND redeemed_at IS NOT NULL) AS redeemed,
        (SELECT count(*)::int FROM lms.enrollments WHERE course_id=$1) AS enrolled,
        (SELECT count(*)::int FROM lms.enrollments WHERE course_id=$1 AND status='active') AS active,
        (SELECT count(*)::int FROM lms.enrollments WHERE course_id=$1 AND status='completed') AS completed,
        (SELECT count(*)::int FROM lms.lesson_progress lp JOIN lms.lessons l ON l.id=lp.lesson_id JOIN lms.modules m ON m.id=l.module_id JOIN lms.course_versions v ON v.id=m.course_version_id WHERE v.course_id=$1 AND lp.status='completed') AS lessons_completed,
        (SELECT count(*)::int FROM lms.assessment_attempts aa JOIN lms.course_versions v ON v.id=aa.course_version_id WHERE v.course_id=$1 AND aa.status='submitted') AS submitted_attempts,
        (SELECT count(*)::int FROM lms.assessment_attempts aa JOIN lms.course_versions v ON v.id=aa.course_version_id WHERE v.course_id=$1 AND aa.status='submitted' AND aa.passed=TRUE) AS passed_attempts,
        (SELECT count(*)::int FROM lms.pilot_feedback WHERE course_id=$1) AS feedback_count,
        (SELECT round(avg(overall_rating),1)::float FROM lms.pilot_feedback WHERE course_id=$1) AS overall,
        (SELECT round(avg(instruction_clarity),1)::float FROM lms.pilot_feedback WHERE course_id=$1) AS clarity,
        (SELECT round(avg(confidence_after),1)::float FROM lms.pilot_feedback WHERE course_id=$1) AS confidence,
        (SELECT count(*)::int FROM lms.support_requests WHERE status IN ('open','in_progress')) AS open_support,
        (SELECT count(*)::int FROM lms.certificates WHERE course_id=$1) AS certificates`,[selected.id]),
      client.query<Feedback>(`SELECT overall_rating,instruction_clarity,confidence_after,issue_categories,comment,submitted_at FROM lms.pilot_feedback
        WHERE course_id=$1 ORDER BY submitted_at DESC LIMIT 50`,[selected.id]),
    ]);
    return {courses:courses.rows,selected,metrics:metrics.rows[0],feedback:feedback.rows};
  });
  return <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800"><Link href="/admin/operations" className="underline">Operations</Link> / Controlled pilot</p>
    <h1 className="mt-2 text-3xl font-bold tracking-tight">Controlled learner pilot</h1>
    <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">Create a course-level invitation by email, then share the course link through an approved internal channel. In controlled pilot mode, only a matching invited email can enroll. The allowlist stores a keyed fingerprint instead of an email address.</p>
    {process.env.LMS_CONTROLLED_PILOT==="true"?<p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm">Controlled enrollment is enabled in this deployment.</p>:<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm">Controlled enrollment is off. Set LMS_CONTROLLED_PILOT=true on the staging deployment before inviting learners.</p>}
    {params.invited&&<p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm">Invitation saved. Share the course access instructions through the approved channel.</p>}{params.state&&<p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm">Invitation not created: {params.state.replaceAll("-"," ")}.</p>}
    <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Invite a learner</h2>{data.courses.length?<form action={invitePilotLearner} className="mt-3 grid gap-3 md:grid-cols-4"><label className="text-sm font-semibold md:col-span-2">Approved published course<select name="courseId" defaultValue={data.selected?.id} className="form-input mt-1" required>{data.courses.map((course)=><option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label className="text-sm font-semibold">Learner email<input name="email" type="email" autoComplete="off" className="form-input mt-1" required/></label><label className="text-sm font-semibold">Invitation validity (days)<input name="days" type="number" min="1" max="90" defaultValue="30" className="form-input mt-1" required/></label><button className="rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-bold text-white md:col-span-4 md:justify-self-start">Add invitation</button></form>:<p className="mt-2 text-sm text-slate-600">No approved published courses are available to pilot yet.</p>}<p className="mt-3 text-xs text-slate-500">The email is normalized and immediately converted to a keyed fingerprint; it is not retained or shown in the invitation list. Revoke or expire invitations through the approved database-owner process.</p></section>
    {data.selected&&data.metrics?<>
      <nav aria-label="Pilot course" className="mt-7 flex flex-wrap gap-2">{data.courses.map((course)=><Link key={course.id} href={`/admin/pilot?course=${course.id}`} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${data.selected?.id===course.id?"border-navy-900 bg-navy-900 text-white":"border-slate-300 bg-white"}`}>{course.title}</Link>)}</nav>
      <section className="mt-5" aria-label="Pilot outcome totals"><h2 className="text-xl font-bold">{data.selected.title} cohort</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Unused invites",data.metrics.invited],["Redeemed invites",data.metrics.redeemed],["Enrollments",data.metrics.enrolled],["Active learners",data.metrics.active],["Completed",data.metrics.completed],["Lessons completed",data.metrics.lessons_completed],["Submitted assessment attempts",data.metrics.submitted_attempts],["Passed attempts",data.metrics.passed_attempts],["Feedback responses",data.metrics.feedback_count],["Overall rating / 5",data.metrics.overall??"—"],["Instruction clarity / 5",data.metrics.clarity??"—"],["Confidence after / 5",data.metrics.confidence??"—"],["Open support requests (all courses)",data.metrics.open_support],["Certificates issued",data.metrics.certificates]].map(([label,value])=><article key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-600">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></article>)}</div><p className="mt-3 text-xs text-slate-500">Counts use course enrollment and progress records. Assessment pass rate is submitted attempts passed ÷ submitted attempts. Certificate verification visits are not tracked to avoid collecting unnecessary visitor data.</p></section>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Learner feedback</h2><p className="mt-1 text-sm text-slate-600">Account names and email addresses are not displayed here. Review comments carefully and remove unsolicited sensitive details under the internal retention policy.</p>{data.feedback.length?<ul className="mt-4 space-y-3">{data.feedback.map((item,index)=><li key={`${item.submitted_at.toISOString()}-${index}`} className="rounded-lg bg-slate-50 p-4"><p className="text-sm font-semibold">Experience {item.overall_rating}/5 · Instructions {item.instruction_clarity}/5{item.confidence_after?` · Confidence ${item.confidence_after}/5`:""}</p>{item.issue_categories.length>0&&<p className="mt-1 text-xs text-slate-600">Topics: {item.issue_categories.join(", ").replaceAll("_"," ")}</p>}{item.comment&&<p className="mt-2 whitespace-pre-wrap text-sm">{item.comment}</p>}<time className="mt-2 block text-xs text-slate-500">{item.submitted_at.toLocaleDateString("en-IN",{timeZone:"UTC"})}</time></li>)}</ul>:<p className="mt-3 text-sm text-slate-600">No feedback has been submitted yet.</p>}</section>
    </>:<p className="mt-7 rounded-xl border border-gold-200 bg-gold-50 p-5 text-sm">Publish an approved, reviewed, non-sandbox course before opening its pilot cohort.</p>}
  </main>;
}
