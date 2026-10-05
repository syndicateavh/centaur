import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, MessageCircle, RotateCcw } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import QuizLeadCapture from '@/components/QuizLeadCapture.jsx';
import {
  FINANCE_QUIZ_DOMAINS,
  FINANCE_QUIZ_QUESTIONS,
  FINANCE_QUIZ_QUESTIONS_PER_DOMAIN,
  FINANCE_QUIZ_TOTAL,
  getQuizQuestions,
} from '@/content/quizLibrary.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { FINANCE_CURRENT_AFFAIRS_WHATSAPP_URL } from '@/content/businessData.js';

const QUESTIONS_PER_ROUND = 20;

function pushQuizEvent(event, fields = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    quiz_funnel: 'role_lead_engine',
    ...fields,
  });
}

function buildRound(questions, seed = 0) {
  if (!questions.length) return [];

  const offset = Math.abs(seed) % questions.length;
  const rotated = [...questions.slice(offset), ...questions.slice(0, offset)];
  return rotated.slice(0, Math.min(QUESTIONS_PER_ROUND, rotated.length));
}

function getScore(questions, answers) {
  return questions.reduce((score, question) => score + (answers[question.id] === question.answer ? 1 : 0), 0);
}

function getDomainFromSearch(search) {
  const requestedDomain = new URLSearchParams(search).get('domain');
  return FINANCE_QUIZ_DOMAINS.some((domain) => domain.id === requestedDomain) ? requestedDomain : 'all';
}

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialDomain = getDomainFromSearch(location.search);
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [round, setRound] = useState(() => buildRound(initialDomain === 'all' ? FINANCE_QUIZ_QUESTIONS : getQuizQuestions(initialDomain)));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = round[questionIndex];
  const selectedDomainRecord = useMemo(
    () => FINANCE_QUIZ_DOMAINS.find((domain) => domain.id === selectedDomain) || null,
    [selectedDomain],
  );
  const availableCount = selectedDomain === 'all'
    ? FINANCE_QUIZ_TOTAL
    : getQuizQuestions(selectedDomain).length;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    const domainId = getDomainFromSearch(location.search);
    if (domainId === selectedDomain) return;

    const questions = domainId === 'all' ? FINANCE_QUIZ_QUESTIONS : getQuizQuestions(domainId);
    setSelectedDomain(domainId);
    setRound(buildRound(questions, Date.now() % Math.max(1, questions.length)));
    setQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setShowExplanation(false);
  }, [location.search, selectedDomain]);

  function startRound(domainId = selectedDomain) {
    const questions = domainId === 'all' ? FINANCE_QUIZ_QUESTIONS : getQuizQuestions(domainId);
    const seed = Date.now() % Math.max(1, questions.length);
    setRound(buildRound(questions, seed));
    setQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setShowExplanation(false);
    pushQuizEvent('quiz_round_started', { quiz_domain: domainId });
  }

  function handleDomainChange(event) {
    const domainId = event.target.value;
    const search = domainId === 'all' ? '' : `?domain=${encodeURIComponent(domainId)}`;
    navigate(`/quiz/${search}#quiz-round-title`);
    setSelectedDomain(domainId);
    pushQuizEvent('quiz_domain_selected', { quiz_domain: domainId });
    startRound(domainId);
  }

  function chooseAnswer(answerIndex) {
    if (!currentQuestion || submitted) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: answerIndex }));
    setShowExplanation(false);
  }

  function moveToNextQuestion() {
    if (!currentQuestion || answers[currentQuestion.id] === undefined) return;
    if (questionIndex === round.length - 1) {
      const completedScore = getScore(round, answers);
      const completedScorePercent = Math.round((completedScore / Math.max(1, round.length)) * 100);
      setScore(completedScore);
      setSubmitted(true);
      pushQuizEvent('quiz_round_completed', {
        quiz_domain: selectedDomain,
        quiz_score_percent: completedScorePercent,
        quiz_questions: round.length,
      });
      return;
    }
    setQuestionIndex((current) => current + 1);
    setShowExplanation(false);
  }

  function moveToPreviousQuestion() {
    if (questionIndex === 0 || submitted) return;
    setQuestionIndex((current) => current - 1);
    setShowExplanation(false);
  }

  const scorePercent = score === null ? 0 : Math.round((score / round.length) * 100);
  const resultLabel = scorePercent >= 80 ? 'Strong foundation' : scorePercent >= 60 ? 'Good progress' : 'Keep practising';

  return (
    <>
      <PageHero
        routeId="quiz"
        eyebrow="BFSI knowledge assessment"
        title="Banking & Finance Career Quiz"
        intro="Test your understanding of investment banking, retail banking, KYC and AML, payments, credit, risk, accounting, FinTech, and other finance roles. Each round serves 20 questions from a growing question bank."
      >
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-white/85">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">{FINANCE_QUIZ_TOTAL.toLocaleString('en-IN')} questions</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">{FINANCE_QUIZ_DOMAINS.length} finance domains</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">20 questions per round</span>
        </div>
      </PageHero>

      <section className="bg-white py-12 sm:py-16" aria-labelledby="quiz-introduction-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div>
              <SectionHeading
                align="left"
                eyebrow="How to use this quiz"
                title="Practise process knowledge, not keyword memorisation"
                intro="Choose a domain or use the full question bank. Read each scenario carefully, select the best answer, and review the explanation after completing the round. The questions are educational and do not replace an employer procedure, regulator guidance, legal advice, or investment advice."
                id="quiz-introduction-title"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-2xl border border-border bg-muted/40 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent-ink">Step 01</p>
                  <h2 className="mt-2 text-xl font-bold text-primary">Choose your focus</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Practise all topics or focus on the banking or finance domain closest to your target role.</p>
                </article>
                <article className="rounded-2xl border border-border bg-muted/40 p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent-ink">Step 02</p>
                  <h2 className="mt-2 text-xl font-bold text-primary">Explain your reasoning</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Use the explanation to connect each answer with evidence, controls, workflow, and escalation.</p>
                </article>
              </div>
            </div>

            <aside className="rounded-2xl border border-border bg-primary p-6 text-white shadow-lg" aria-label="Quiz controls">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Question bank</p>
              <p className="mt-3 text-4xl font-black">{availableCount.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-sm text-white/70">available in this selection</p>
              <label htmlFor="quiz-domain" className="mt-6 block text-sm font-bold text-white">Choose a quiz domain</label>
              <select
                id="quiz-domain"
                value={selectedDomain}
                onChange={handleDomainChange}
                className="mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-white px-3 py-2 text-sm font-semibold text-primary"
              >
                <option value="all">All banking and finance topics</option>
                {FINANCE_QUIZ_DOMAINS.map((domain) => <option key={domain.id} value={domain.id}>{domain.label}</option>)}
              </select>
              {selectedDomainRecord && (
                <p className="mt-4 text-sm leading-relaxed text-white/75">{selectedDomainRecord.summary}</p>
              )}
              <button type="button" onClick={() => startRound()} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-bold text-primary transition hover:-translate-y-0.5">
                Start a fresh round <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-muted py-12 sm:py-16" aria-labelledby="quiz-round-title">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">Round in progress</p>
              <h2 id="quiz-round-title" className="mt-2 text-3xl font-bold text-primary">Question {Math.min(questionIndex + 1, round.length)} of {round.length}</h2>
            </div>
            <p className="text-sm font-semibold text-muted-foreground" role="status" aria-live="polite">{answeredCount} answered in this round</p>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((questionIndex + 1) / Math.max(1, round.length)) * 100}%` }} />
          </div>

          {currentQuestion && !submitted && (
            <article className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8" data-quiz-question={currentQuestion.id}>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-accent-ink">
                <span>{currentQuestion.domainLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.topic}</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold leading-tight text-primary sm:text-3xl">{currentQuestion.question}</h3>
              <fieldset className="mt-7 space-y-3">
                <legend className="sr-only">Choose one answer</legend>
                {currentQuestion.options.map((option, index) => {
                  const optionId = `${currentQuestion.id}-${index}`;
                  const isSelected = answers[currentQuestion.id] === index;
                  return (
                    <label key={optionId} htmlFor={optionId} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${isSelected ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/70'}`}>
                      <input id={optionId} name={currentQuestion.id} type="radio" value={index} checked={isSelected} onChange={() => chooseAnswer(index)} className="mt-1 h-4 w-4 accent-[hsl(var(--accent-ink))]" />
                      <span className="leading-relaxed text-foreground/85">{option}</span>
                    </label>
                  );
                })}
              </fieldset>
              {showExplanation && (
                <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4" role="status">
                  <p className="font-bold text-primary">Why this matters</p>
                  <p className="mt-2 leading-relaxed text-foreground/80">{currentQuestion.explanation}</p>
                </div>
              )}
              <div className="mt-7 flex flex-wrap justify-between gap-3">
                <button type="button" onClick={moveToPreviousQuestion} disabled={questionIndex === 0} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-5 py-3 font-bold text-primary disabled:cursor-not-allowed disabled:opacity-45">Previous</button>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setShowExplanation((current) => !current)} disabled={answers[currentQuestion.id] === undefined} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-primary/20 px-5 py-3 font-bold text-primary disabled:cursor-not-allowed disabled:opacity-45">{showExplanation ? 'Hide explanation' : 'Show explanation'}</button>
                  <button type="button" onClick={moveToNextQuestion} disabled={answers[currentQuestion.id] === undefined} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{questionIndex === round.length - 1 ? 'Finish round' : 'Next question'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </div>
            </article>
          )}

          {submitted && (
            <article className="rounded-2xl border border-accent/50 bg-white p-6 shadow-lg sm:p-8" aria-labelledby="quiz-result-title" data-quiz-result>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">Round complete</p>
                  <h3 id="quiz-result-title" className="mt-2 text-3xl font-black text-primary">{score} / {round.length}: {resultLabel}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">You scored {scorePercent}%. Review the explanations below, then start another round to practise a different set of topics.</p>
                </div>
                <div className="grid h-24 w-24 place-items-center rounded-full border-8 border-accent/30 text-center" aria-label={`${scorePercent} percent score`}>
                  <span className="text-2xl font-black text-primary">{scorePercent}%</span>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                {round.map((question, index) => {
                  const correct = answers[question.id] === question.answer;
                  return (
                    <details key={question.id} className="rounded-xl border border-border p-4" open={!correct}>
                      <summary className="cursor-pointer list-none font-bold text-primary"><span className="mr-2 inline-flex align-middle">{correct ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" /> : <span className="inline-grid h-5 w-5 place-items-center rounded-full bg-red-100 text-xs text-red-700" aria-hidden="true">!</span>}</span>Question {index + 1}: {question.topic}</summary>
                      <p className="mt-3 leading-relaxed text-foreground/80">{question.explanation}</p>
                    </details>
                  );
                })}
              </div>
              <button type="button" onClick={() => startRound()} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Start another round</button>
            </article>
          )}

          <QuizLeadCapture
            domainId={selectedDomain}
            domain={selectedDomainRecord}
            score={score}
            roundLength={round.length}
          />
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="quiz-domains-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Question-bank coverage"
            title="Choose a banking or finance career domain"
            intro="Select a domain to start a focused quiz round. Each card takes you back to the quiz with that topic selected in the menu."
            id="quiz-domains-title"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FINANCE_QUIZ_DOMAINS.map((domain) => (
              <Link key={domain.id} to={`/quiz/?domain=${encodeURIComponent(domain.id)}#quiz-round-title`} className="rounded-2xl border border-border bg-muted/30 p-5 text-left transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm">
                <p className="text-sm font-bold text-accent-ink">{FINANCE_QUIZ_QUESTIONS_PER_DOMAIN} questions</p>
                <h3 className="mt-2 text-lg font-bold text-primary">{domain.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{domain.summary}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Start this quiz <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="quiz-next-steps-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Keep exploring"
            title="Build your next banking and finance career step"
            intro="Use your quiz practice alongside Centaur Careers' courses, career guides, resources, and support pages. These internal routes make it easy to continue learning after each round."
            id="quiz-next-steps-title"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Financial Operations Masterclass', description: 'Compare the course curriculum and finance operations learning path.', to: '/courses/' },
              { label: 'Finance career guides', description: 'Explore role expectations, skills, and career paths across banking and finance.', to: '/career-guides/' },
              { label: 'Interview resources', description: 'Prepare with practical interview questions and role-specific study material.', to: '/resources/' },
              { label: 'Career insights blog', description: 'Read current explainers about banking operations, controls, and finance careers.', to: '/blog/' },
              { label: 'Program FAQs', description: 'Find quick answers about learning support, eligibility, and the programme.', to: '/faqs/' },
              { label: 'Contact Centaur Careers', description: 'Ask the team about the right next step for your finance career goals.', to: '/contact/' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="group rounded-2xl border border-border bg-muted/30 p-5 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm">
                <h3 className="text-lg font-bold text-primary">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Explore page <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-warm py-16 sm:py-20" aria-labelledby="quiz-sources-title">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Official learning references"
            title="Use primary sources for current rules"
            intro="The quiz is introductory learning material. For current requirements, product rules, payment guidance, or compliance decisions, use the relevant official source and employer procedure."
            id="quiz-sources-title"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {[...new Map(FINANCE_QUIZ_DOMAINS.flatMap((domain) => domain.sources.map((source) => [source.url, source]))).values()].slice(0, 8).map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-4 font-bold text-primary transition hover:border-accent hover:shadow-sm">
                <span>{source.label}</span><ExternalLink className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
              </a>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2" aria-label="Quiz social hashtags">
            {['#BankingQuiz', '#FinanceQuiz', '#BFSICareers', '#FinanceOperations', '#BankingJobs'].map((hashtag) => <span key={hashtag} className="rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-muted-foreground">{hashtag}</span>)}
          </div>
          <div className="mt-8 rounded-2xl bg-primary p-6 text-white shadow-lg sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Finance current affairs</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Join the WhatsApp updates</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">Request access to current finance, banking, payments, and BFSI affairs shared by Centaur Careers. WhatsApp will open with a ready-to-send request message.</p>
              </div>
              <a href={FINANCE_CURRENT_AFFAIRS_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary transition hover:-translate-y-0.5 hover:shadow-lg">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> Request to join
              </a>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">Want deeper role context? <Link to="/resources/investment-banking-interview-questions/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Practise investment banking interview questions</Link> or <Link to="/career-guides/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">browse the finance career guides</Link>.</p>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('quiz')} />
      <CtaSection title="Turn practice into a finance learning plan" description="Use your results to identify topics to revise, then compare the Financial Operations Masterclass curriculum, learning options, fees, and current support terms." primaryTo="/courses/" primaryLabel="Compare course details" primaryAnalyticsIntent="commercial_program" secondaryTo="/contact/" secondaryLabel="Ask about the program" />
    </>
  );
}
