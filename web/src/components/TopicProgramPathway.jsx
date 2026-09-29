import React from 'react';
import { Link } from 'react-router';
import { JOB_GUARANTEE, PROGRAM } from '@/content/sourceContent.js';
import { getTopicProgramPath } from '@/content/topicProgramPaths.js';

export default function TopicProgramPathway({ topicId }) {
  const topic = getTopicProgramPath(topicId);
  if (!topic) return null;

  return (
    <section data-topic-program={topicId} className="bg-muted py-14 sm:py-20" aria-labelledby={`${topicId}-program-heading`}>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-foreground">Topic to career path</p>
        <h2 id={`${topicId}-program-heading`} className="mt-3 text-3xl font-bold text-primary">Practise {topic.label} in the full Masterclass</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground">{topic.decision}</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-xl font-bold text-primary">Try a role-specific task</h3>
            <p className="mt-3 text-muted-foreground">{topic.practice}</p>
            <p className="mt-4 text-sm text-muted-foreground"><strong className="text-primary">Model reasoning:</strong> {topic.answer}</p>
            <Link to={topic.casePath} className="mt-5 inline-flex min-h-11 items-center font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{topic.caseLabel}</Link>
          </article>
          <article className="rounded-2xl border border-border bg-white p-6">
            <h3 className="text-xl font-bold text-primary">Understand the program guarantee</h3>
            <p className="mt-3 text-muted-foreground">{JOB_GUARANTEE.description}</p>
            <p className="mt-4 text-sm text-muted-foreground">{topic.roleBoundary} This subject is one part of the {PROGRAM.name}, which is the single program offered here.</p>
            <Link to={JOB_GUARANTEE.termsPath} className="mt-5 inline-flex min-h-11 items-center font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read the published guarantee summary and request current written terms</Link>
          </article>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={topic.rolePath} className="inline-flex min-h-11 items-center rounded-xl border border-primary px-5 py-3 font-bold text-primary">{topic.roleLabel}</Link>
          <Link to="/courses/" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 font-bold text-white">Review the full Masterclass</Link>
          <Link to="/contact/" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-5 py-3 font-bold text-primary">Ask about {topic.label} fit</Link>
        </div>
      </div>
    </section>
  );
}
