import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

const DEFAULT_ITEMS = Object.freeze([
  'Match the published syllabus with the workflow or role you want to understand.',
  'Confirm the current cohort schedule, learning mode, and fees with the team.',
  'Ask for the current certificate wording and completion requirements.',
  'Review the written support and Job Guarantee Program terms before enrolling.',
]);

export default function CommercialDecisionChecklist({
  context = 'this program',
  title = 'What to verify before you enrol',
  intro = 'Use this checklist to compare the published learning scope with your goals. Provider details, cohort availability, and support terms can change, so confirm them directly before making an enrolment decision.',
  items = DEFAULT_ITEMS,
  primaryLabel = 'Review the full program',
  primaryTo = '/courses/',
}) {
  return (
    <section data-commercial-section="decision-checklist" data-conversion-path="/contact/" aria-labelledby="commercial-decision-checklist-title" className="bg-muted py-14 sm:py-16">
      <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-ink">Before you enrol</p>
          <h2 id="commercial-decision-checklist-title" className="mt-3 text-3xl font-bold text-primary">{title}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{intro}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">This page describes {context}; it does not create a separate course, credential, city branch, or module-level employment promise.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={primaryTo} data-conversion-cta data-analytics-id="decision_checklist_primary" data-analytics-intent="commercial_program" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">{primaryLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/placements/#job-guarantee-terms" data-conversion-cta data-analytics-id="decision_checklist_terms" data-analytics-intent="commercial_placement" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 font-bold text-primary">Read guarantee summary <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/contact/" data-conversion-cta data-analytics-id="decision_checklist_contact" data-analytics-intent="commercial_program" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 font-bold text-primary">Ask about this cohort <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-xl font-bold text-primary">Questions to ask the team</h3>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 leading-relaxed text-foreground/85">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
