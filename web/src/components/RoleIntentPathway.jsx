import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { SectionHeading } from '@/components/PageShell.jsx';

function quizPath(intent) {
  return '/quiz/?domain=' + encodeURIComponent(intent.quizDomainId) + '#quiz-round-title';
}

function PathLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/15 bg-white px-4 py-2.5 font-bold text-primary transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm">
      {children} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export default function RoleIntentPathway({ intent, compact = false }) {
  if (!intent) return null;

  const rolePageLabel = intent.kind === 'guide' ? 'Read the role guide' : 'Read the specialist article';

  if (compact) {
    return (
      <div data-role-intent-pathway={intent.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">Specialist search path</p>
        <h3 className="mt-3 text-2xl font-bold text-primary">{intent.label}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{intent.summary}</p>
        <p className="mt-4 text-sm font-semibold text-foreground/80"><span className="font-bold text-primary">Answers:</span> {intent.primaryQuestion}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <PathLink to={intent.canonicalPath}>{rolePageLabel}</PathLink>
          <PathLink to={quizPath(intent)}>Practise this role</PathLink>
          <PathLink to={intent.coursePath}>{intent.coursePathLabel}</PathLink>
        </div>
      </div>
    );
  }

  return (
    <section data-role-intent-pathway={intent.id} className="bg-muted py-14 sm:py-16" aria-labelledby={intent.id + '-pathway-title'}>
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="Role-intent pathway"
          title={'Explore ' + intent.label}
          intro={intent.summary}
          id={intent.id + '-pathway-title'}
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent-ink">Questions this path answers</p>
            <p className="mt-3 text-lg font-bold leading-relaxed text-primary">{intent.primaryQuestion}</p>
            <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
              {intent.searchQuestions.map((question) => <li key={question} className="rounded-lg bg-muted/60 px-3 py-2">{question}</li>)}
            </ul>
          </div>
          <div className="flex flex-col items-stretch gap-3 lg:min-w-64">
            <PathLink to={intent.canonicalPath}>{rolePageLabel}</PathLink>
            <PathLink to={quizPath(intent)}>Practise {intent.label}</PathLink>
            <PathLink to={intent.coursePath}>{intent.coursePathLabel}</PathLink>
          </div>
        </div>
        {intent.articleLinks.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-white p-6">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent-ink">Continue with a related workflow</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {intent.articleLinks.map((article) => (
                <li key={article.path}>
                  <Link to={article.path} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{article.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
