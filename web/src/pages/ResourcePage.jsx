import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero } from '@/components/PageShell.jsx';
import { getResource } from '@/content/resources.js';
import { getLinkableAuthorityAsset } from '@/content/seo/authorityBuilding.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const formatInr = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

function AccountingInterviewCase({ caseStudy }) {
  const entries = [...caseStudy.sourceEvents, { id: '5', ...caseStudy.bankFee }];
  const trialBalanceTotal = caseStudy.closingBalances.reduce((total, account) => total + account.debit, 0);

  return (
    <section data-accounting-interview-case aria-labelledby="accounting-case-title" className="mt-12 space-y-7 rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">Fictional practice case</p>
        <h2 id="accounting-case-title" className="mt-2 text-2xl font-bold text-primary">{caseStudy.name}</h2>
        <p className="mt-3 leading-relaxed">Try the first four entries, prepare a trial balance, and explain the bank difference. All events and amounts are invented for this exercise.</p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-primary">Source events</h3>
        <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed">
          {caseStudy.sourceEvents.map((entry) => <li key={entry.id}>{entry.event}</li>)}
        </ol>
        <p className="mt-4 rounded-xl bg-white p-4 font-semibold text-primary">Bank statement clue: {caseStudy.bankFee.event}</p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-primary">Answer key: journal entries</h3>
        <p className="mt-2 leading-relaxed">The fee entry follows confirmation of the statement and the organisation’s authorised posting process.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[520px] w-full border-collapse text-left text-sm">
            <caption className="sr-only">Debit and credit answer key for the fictional accounting case</caption>
            <thead><tr className="border-b border-border bg-white"><th scope="col" className="p-3">Event</th><th scope="col" className="p-3">Debit</th><th scope="col" className="p-3">Credit</th><th scope="col" className="p-3 text-right">Amount</th></tr></thead>
            <tbody>{entries.map((entry) => <tr key={entry.id} className="border-b border-border"><th scope="row" className="p-3 font-semibold">{entry.id}</th><td className="p-3">{entry.debit}</td><td className="p-3">{entry.credit}</td><td className="p-3 text-right">{formatInr(entry.amount)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-primary">Answer key: closing trial balance</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[440px] w-full border-collapse text-left text-sm">
            <caption className="sr-only">Trial balance after the authorised bank fee entry</caption>
            <thead><tr className="border-b border-border bg-white"><th scope="col" className="p-3">Account</th><th scope="col" className="p-3 text-right">Debit</th><th scope="col" className="p-3 text-right">Credit</th></tr></thead>
            <tbody>{caseStudy.closingBalances.map((account) => <tr key={account.account} className="border-b border-border"><th scope="row" className="p-3 font-medium">{account.account}</th><td className="p-3 text-right">{account.debit ? formatInr(account.debit) : '—'}</td><td className="p-3 text-right">{account.credit ? formatInr(account.credit) : '—'}</td></tr>)}</tbody>
            <tfoot><tr className="bg-white font-bold text-primary"><th scope="row" className="p-3">Total</th><td className="p-3 text-right">{formatInr(trialBalanceTotal)}</td><td className="p-3 text-right">{formatInr(trialBalanceTotal)}</td></tr></tfoot>
          </table>
        </div>
        <p className="mt-4 leading-relaxed">Service revenue of {formatInr(7000)} less rent of {formatInr(3000)} and bank charges of {formatInr(caseStudy.bankFee.amount)} gives {formatInr(caseStudy.profit)} profit. Bank of {formatInr(21800)} plus trade receivables of {formatInr(2000)} gives {formatInr(caseStudy.closingAssets)} assets, equal to capital of {formatInr(20000)} plus profit. Before the fee is posted, the cash book shows {formatInr(22000)} and the statement shows {formatInr(21800)}; explain and evidence that {formatInr(caseStudy.bankFee.amount)} difference before requesting the authorised entry.</p>
      </div>

      <div>
        <h3 className="text-xl font-bold text-primary">Self-check rubric</h3>
        <p className="mt-2">Score one point for each item you can explain without reading the answer key:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">{caseStudy.rubric.map((item) => <li key={item}>{item}</li>)}</ol>
        <p className="mt-3 text-sm text-muted-foreground">This is a study aid, not an employer’s interview or assessment rubric.</p>
      </div>

      <nav aria-label="Related accounting interview preparation" className="border-t border-border pt-5">
        <h3 className="text-lg font-bold text-primary">Continue with the right next step</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li><Link to="/resources/accounting-basics/" className="font-bold text-primary underline">Review debit, credit, journal, and trial-balance basics</Link></li>
          <li><Link to="/resources/reconciliation-in-finance/" className="font-bold text-primary underline">Practise investigating a reconciliation break</Link></li>
          <li><Link to="/blog/finance-interview-questions-freshers/" className="font-bold text-primary underline">Prepare broader fresher and HR interview answers</Link></li>
          <li><Link to="/courses/" className="font-bold text-primary underline">Review the Financial Operations Masterclass</Link></li>
        </ul>
      </nav>
      <p className="border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">For formal study of journals, ledgers, trial balances, and bank reconciliation, use <a href="https://www.icai.org/post/17894" target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline">ICAI study material</a>. The case above is an original simplified teaching example; actual accounting treatment follows the entity’s policies and applicable standards.</p>
    </section>
  );
}

export default function ResourcePage({ resourceId }) {
  const resource = getResource(resourceId);
  if (!resource) return null;

  const route = getSeoRoute(resource.routeId);
  const authorityAsset = getLinkableAuthorityAssetByPath(resource.path);

  return (
    <>
      <PageHero routeId={route.id} eyebrow={resource.label} title={resource.h1} intro={resource.description} />

      <article data-resource={resource.id} data-authority-asset={authorityAsset?.id} className="bg-white py-14 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
            <span className="font-bold text-primary">{resource.author.name}</span>
            <span aria-hidden="true">·</span>
            <span>{resource.author.role}</span>
            <span aria-hidden="true">·</span>
            <time className="inline-flex items-center gap-2" dateTime={resource.updatedAt}><CalendarDays className="h-4 w-4" aria-hidden="true" />Updated {resource.updatedAt}</time>
          </div>
          {authorityAsset && (
            <aside data-resource-authority-note className="mb-10 rounded-2xl border border-accent/30 bg-accent/10 p-6 text-primary">
              <h2 className="text-xl font-bold">A useful reference for learners and editors</h2>
              <p className="mt-2 leading-relaxed">{authorityAsset.readerOutcome} This page is written for reader value first; confirm current role, provider, regulatory, or employer-specific requirements before relying on it.</p>
            </aside>
          )}
          <BlogContentRenderer blocks={resource.body} />
          {resource.caseStudy && <AccountingInterviewCase caseStudy={resource.caseStudy} />}

          <nav data-resource-related aria-label="Related resource pages" className="mt-12 rounded-2xl bg-muted p-6">
            <h2 className="text-xl font-bold text-primary">Continue your preparation</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <li><Link to="/resources/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Browse all finance career resources</Link></li>
              <li><Link to="/career-guides/financial-operations-faq/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read finance operations FAQs</Link></li>
            </ul>
          </nav>

          <p className="mt-10 text-sm text-muted-foreground">This resource provides general educational information. Verify current requirements with the relevant regulator, payment-system operator, employer, or provider before making decisions.</p>
        </div>
      </article>

      <InternalLinkGroup links={getInternalLinks(resource.routeId)} />
      <CtaSection eyebrow="Put this topic in context" title={`Explore ${resource.breadcrumbLabel.toLowerCase()} in the wider finance curriculum`} description="See how the Financial Operations Masterclass covers related workflows, then check current learning options, fees, and support terms. Contact the team if you want guidance on course fit." primaryTo="/courses/" primaryLabel="Review course details" primaryAnalyticsIntent="commercial_program" secondaryTo="/contact/" secondaryLabel="Ask about course fit" />
    </>
  );
}

function getLinkableAuthorityAssetByPath(path) {
  const asset = getLinkableAuthorityAsset(
    {
      '/resources/investment-banking-interview-questions/': 'banking-interview-resource',
      '/resources/finance-gk/': 'finance-foundations-reference',
      '/resources/accounting-basics/': 'accounting-basics-reference',
      '/resources/reconciliation-in-finance/': 'reconciliation-workflow-reference',
    }[path],
  );
  return asset;
}
