import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

const WORKFLOWS = Object.freeze({
  'investment-banking-operations': Object.freeze([
    Object.freeze({
      title: 'Trade details',
      label: 'Capture and validate',
      detail: 'Start with the trade reference, product, dates, cash amount, and securities details. A clear record gives each later check a reliable starting point.',
      checks: ['Confirm the instruction is complete', 'Compare key trade details with the available records'],
    }),
    Object.freeze({
      title: 'Matching and checks',
      label: 'Compare records',
      detail: 'Compare the relevant instructions and records, then identify mismatches that need investigation. A mismatch stays an exception until its evidence and owner are clear.',
      checks: ['Check counterparty and settlement details', 'Record and route unresolved differences'],
    }),
    Object.freeze({
      title: 'Settlement and reconciliation',
      label: 'Track and reconcile',
      detail: 'Track settlement status and compare resulting cash or securities records. Document outstanding breaks and follow the authorised process for resolution.',
      checks: ['Review settlement status and dates', 'Keep evidence for each reconciliation break'],
    }),
  ]),
  'finance-operations': Object.freeze([
    Object.freeze({
      title: 'Application file',
      label: 'Review the records',
      detail: 'Check that the application and supporting records are complete. Record missing or inconsistent information so the right person can review it.',
      checks: ['Track required documents', 'Separate verified details from open questions'],
    }),
    Object.freeze({
      title: 'Credit review',
      label: 'Assess and document',
      detail: 'Organise financial information and review it against the relevant lending criteria. Document observations and leave approval decisions with the authorised reviewer.',
      checks: ['Review income, obligations, and supporting evidence', 'Note risks or gaps for authorised review'],
    }),
    Object.freeze({
      title: 'Processing and servicing',
      label: 'Track the hand-offs',
      detail: 'Follow approved conditions through processing and servicing. Keep records aligned and route repayment or account exceptions through the applicable process.',
      checks: ['Track conditions and processing status', 'Document servicing or repayment exceptions'],
    }),
  ]),
  'retail-banking': Object.freeze([
    Object.freeze({
      title: 'Customer request',
      label: 'Understand the need',
      detail: 'Identify the customer request and the service or product area involved. Confirm what information is needed before the request moves forward.',
      checks: ['Capture the request accurately', 'Identify the relevant service pathway'],
    }),
    Object.freeze({
      title: 'Records and checks',
      label: 'Review the information',
      detail: 'Check the available customer, account, or lending records for completeness and consistency. Keep any missing information visible for follow-up.',
      checks: ['Review supporting documents and account details', 'Record missing information for follow-up'],
    }),
    Object.freeze({
      title: 'Service and hand-off',
      label: 'Complete or route',
      detail: 'Move the request through the appropriate branch or operations process, keeping the customer record and next action clear for each hand-off.',
      checks: ['Track the request status', 'Route decisions and exceptions to the right owner'],
    }),
  ]),
});

export default function ModuleWorkflowExplorer({ courseId, title }) {
  const steps = WORKFLOWS[courseId];
  const [activeStep, setActiveStep] = useState(0);
  if (!steps) return null;

  const step = steps[activeStep];
  const panelId = `module-workflow-panel-${courseId}`;

  return (
    <section className="module-workflow-section bg-primary py-16 text-white sm:py-20" aria-labelledby={`${courseId}-workflow-heading`}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Explore the workflow</p>
          <h2 id={`${courseId}-workflow-heading`} className="mt-3 text-3xl font-bold sm:text-4xl">See how {title} connects</h2>
          <p className="mt-4 leading-relaxed text-white/70">Select a stage to explore a general example of the records, checks, and hand-offs associated with this subject area.</p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="module-workflow-steps" role="group" aria-label={`${title} workflow stages`}>
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={`module-workflow-step ${activeStep === index ? 'is-active' : ''}`}
                aria-pressed={activeStep === index}
                aria-controls={panelId}
                onClick={() => setActiveStep(index)}
              >
                <span className="module-workflow-step-index" aria-hidden="true">0{index + 1}</span>
                <span className="module-workflow-step-copy">
                  <span className="module-workflow-step-title">{item.title}</span>
                  <span className="module-workflow-step-label">{item.label}</span>
                </span>
                <span className="module-workflow-step-indicator" aria-hidden="true"><ArrowRight className="h-4 w-4" /></span>
              </button>
            ))}
          </div>

          <article key={activeStep} id={panelId} className="module-workflow-panel" aria-live="polite" aria-atomic="true">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Stage 0{activeStep + 1}</p>
            <h3 className="mt-3 text-2xl font-bold text-white">{step.title}</h3>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/75">{step.detail}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {step.checks.map((check) => (
                <li key={check} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-relaxed text-white/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{check}
                </li>
              ))}
            </ul>
            <Link to="/contact/" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
              Ask about {title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-white/50">Illustrative workflow for learning context. Actual procedures vary by institution and role.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
