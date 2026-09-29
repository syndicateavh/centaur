import React, { useState } from 'react';
import { ArrowRight, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { getQuizLeadPath } from '@/content/quizLeadPaths.js';
import { trackAnalyticsEvent } from '@/analytics/ga4.js';
import { getMeasurementEventFields } from '@/analytics/measurementTaxonomy.js';
import { SITE_ORIGIN } from '@/seo/siteConfig.js';

function pushQuizLeadEvent(event, fields = {}) {
  if (typeof window === 'undefined') return;
  trackAnalyticsEvent(event, {
    page_path: '/quiz/',
    page_location: `${SITE_ORIGIN}/quiz/`,
    ...getMeasurementEventFields('/quiz/'),
    quiz_funnel: 'role_lead_engine',
    ...fields,
  });
}

function scoreLabel(scorePercent) {
  if (scorePercent >= 80) return 'Strong foundation';
  if (scorePercent >= 60) return 'Good progress';
  return 'Keep practising';
}

export default function QuizLeadCapture({ domainId, domain, score, roundLength }) {
  const leadPath = getQuizLeadPath(domainId);
  const [fields, setFields] = useState({
    fullName: '',
    contact: '',
    city: '',
    preferredMode: 'Need guidance',
    consent: false,
  });
  const [error, setError] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const scorePercent = score === null ? 0 : Math.round((score / Math.max(1, roundLength)) * 100);
  const focusLabel = domain?.label || 'All banking and finance topics';

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setFields((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function createMessage() {
    return [
      'Hi Centaur Careers, I completed the Banking & Finance Quiz.',
      'Quiz focus: ' + focusLabel,
      'Score: ' + score + '/' + roundLength + ' (' + scorePercent + '% - ' + scoreLabel(scorePercent) + ')',
      'Role direction: ' + leadPath.roleLabel,
      'Name: ' + fields.fullName.trim(),
      'Preferred contact: ' + fields.contact.trim(),
      fields.city.trim() ? 'City: ' + fields.city.trim() : '',
      'Preferred mode: ' + fields.preferredMode,
      'I would like guidance on: ' + leadPath.nextStep,
    ].filter(Boolean).join('\n');
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!fields.fullName.trim() || !fields.contact.trim()) {
      setError('Please add your name and a phone number or email address.');
      return;
    }
    if (!fields.consent) {
      setError('Please confirm that Centaur Careers may use these details to respond to your request.');
      return;
    }

    const destination = 'https://wa.me/' + BUSINESS_DATA.telephone.replace(/\D/g, '') + '?text=' + encodeURIComponent(createMessage());
    setError('');
    setWhatsappUrl(destination);
    // This prepares a WhatsApp draft; only the visitor can send the message.
    pushQuizLeadEvent('quiz_whatsapp_request_prepared', {
      quiz_domain: domainId,
      quiz_role: leadPath.roleLabel,
      quiz_score_percent: scorePercent,
      lead_channel: 'whatsapp',
      consent_recorded: true,
      lead_intent_group: 'decision_quiz',
      conversion_stage: 'decide',
    });
    window.open(destination, '_blank', 'noopener,noreferrer');
  }

  if (score === null) {
    return (
      <aside data-quiz-lead-engine data-quiz-lead-state="locked" className="mt-8 rounded-2xl border border-primary/15 bg-primary p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Your next step</p>
        <h3 className="mt-2 text-2xl font-bold text-white">Complete the round to unlock role guidance</h3>
        <p className="mt-3 max-w-2xl leading-relaxed text-white/75">After your score, you can prepare a role-fit request with a summary of your quiz focus, result, and preferred learning direction.</p>
      </aside>
    );
  }

  if (whatsappUrl) {
    return (
      <section data-quiz-lead-engine data-quiz-lead-state="submitted" className="mt-8 rounded-2xl border border-accent/50 bg-primary p-6 text-white shadow-lg sm:p-8" aria-labelledby="quiz-lead-confirmation-title">
        <div className="flex items-start gap-4">
          <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Request prepared</p>
            <h3 id="quiz-lead-confirmation-title" className="mt-2 text-2xl font-bold text-white">Your role-guidance message is ready</h3>
            <p className="mt-3 leading-relaxed text-white/75">WhatsApp should have opened with your quiz focus, score, and preferred direction. If it did not open, use the button below.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a data-analytics-id="quiz-lead-whatsapp-reopen" data-analytics-channel="whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary">
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Open WhatsApp again
          </a>
          <Link to={leadPath.rolePath} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white">
            Read the {leadPath.roleLabel} path <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section data-quiz-lead-engine data-quiz-lead-state="ready" className="mt-8 rounded-2xl border border-accent/50 bg-primary p-6 text-white shadow-lg sm:p-8" aria-labelledby="quiz-lead-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,26rem)]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Turn your result into a conversation</p>
          <h3 id="quiz-lead-title" className="mt-2 text-2xl font-bold text-white">Get guidance for {leadPath.roleLabel}</h3>
          <p className="mt-3 leading-relaxed text-white/75">You scored {scorePercent}% in {focusLabel}. Share a few details, then send the prepared WhatsApp message so we can discuss the role direction you practised.</p>
          <div className="mt-5 rounded-xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm font-bold text-accent">Recommended next step</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{leadPath.nextStep}</p>
            <Link to={leadPath.rolePath} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent underline decoration-accent decoration-2 underline-offset-4">Read the role path <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 text-primary shadow-sm sm:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent-ink">Request role guidance</p>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="quiz-lead-name" className="text-sm font-bold">Your name</label>
              <input id="quiz-lead-name" name="fullName" value={fields.fullName} onChange={updateField} required autoComplete="name" className="mt-1 min-h-11 w-full rounded-xl border border-border px-3 py-2" />
            </div>
            <div>
              <label htmlFor="quiz-lead-contact" className="text-sm font-bold">Phone or email</label>
              <input id="quiz-lead-contact" name="contact" value={fields.contact} onChange={updateField} required autoComplete="email tel" className="mt-1 min-h-11 w-full rounded-xl border border-border px-3 py-2" />
            </div>
            <div>
              <label htmlFor="quiz-lead-city" className="text-sm font-bold">City <span className="font-normal text-muted-foreground">(optional)</span></label>
              <input id="quiz-lead-city" name="city" value={fields.city} onChange={updateField} autoComplete="address-level2" className="mt-1 min-h-11 w-full rounded-xl border border-border px-3 py-2" />
            </div>
            <div>
              <label htmlFor="quiz-lead-mode" className="text-sm font-bold">What would help most?</label>
              <select id="quiz-lead-mode" name="preferredMode" value={fields.preferredMode} onChange={updateField} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-white px-3 py-2">
                <option>Need guidance</option>
                <option>Online learning details</option>
                <option>Lucknow in-person details</option>
                <option>Interview preparation</option>
              </select>
            </div>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <input type="checkbox" name="consent" checked={fields.consent} onChange={updateField} className="mt-1 h-4 w-4 accent-[hsl(var(--accent-ink))]" />
              <span>I agree Centaur Careers may use these details to respond to this request. Submitting opens WhatsApp with the message for me to send.</span>
            </label>
            {error && <p className="text-sm font-semibold text-red-700" role="alert">{error}</p>}
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary transition hover:-translate-y-0.5 hover:shadow-lg">
              <MessageCircle className="h-5 w-5" aria-hidden="true" /> Open my WhatsApp request
            </button>
            <a data-analytics-id="quiz-lead-email" href={'mailto:' + BUSINESS_DATA.email + '?subject=' + encodeURIComponent('Quiz role guidance request') + '&body=' + encodeURIComponent(createMessage())} className="inline-flex items-center gap-2 text-sm font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
              <Mail className="h-4 w-4" aria-hidden="true" /> Prefer email?
            </a>
            <a data-analytics-id="quiz-lead-application" data-analytics-channel="enrollment" href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
              Apply directly <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
