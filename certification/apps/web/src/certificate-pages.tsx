import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { loadCurrentUser } from './lib/auth-api.js';
import { getCertificateDownloadUrl, listAdminCertificates, listLearnerCertificates, retryCertificate, revokeCertificate, verifyCertificate, type CertificateStatus } from './lib/certificates-api.js';
import { Button } from './components/ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';
import { CentaurBrand, PortalNav } from './components/brand.js';

function Header({ title, eyebrow, back = '/dashboard' }: { title: string; eyebrow: string; back?: string }) {
  const admin = eyebrow === 'Administration';
  return <header className="app-header"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8"><div><CentaurBrand /><p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{eyebrow}</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1></div><Button asChild variant="outline"><Link to={back}>Back</Link></Button></div><div className="mx-auto max-w-7xl px-4 sm:px-8"><PortalNav admin={admin} /></div></header>;
}
function statusLabel(status: CertificateStatus) { return status === 'ready' ? 'Available' : status === 'pending' || status === 'processing' ? 'Generating' : status === 'failed' ? 'Needs retry' : 'Revoked'; }

export function LearnerCertificatesPage() {
  const user = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  const query = useQuery({ queryKey: ['learnerCertificates'], queryFn: listLearnerCertificates, enabled: Boolean(user.data) });
  if (user.isPending) return <main className="p-10 text-center text-slate-600">Loading account…</main>;
  if (user.isError) return <main className="p-10 text-center text-red-700">Could not load your account.</main>;
  if (!user.data) return <Navigate to="/login" replace />;
  return <main className="min-h-screen bg-paper"><Header title="My certificates" eyebrow="Learner"/><section className="mx-auto max-w-6xl space-y-4 px-5 py-10 sm:px-8">
    {query.isPending && <p className="text-sm text-slate-600">Loading certificates…</p>}{query.isError && <p role="alert" className="text-sm text-red-700">Certificates could not be loaded. Refresh to try again.</p>}
    {query.data?.length === 0 && <Card><CardHeader><CardTitle>No certificates yet</CardTitle><CardDescription>Certificates appear here after you complete a certificate enabled course.</CardDescription></CardHeader><CardContent><Button asChild><Link to="/my-courses">View my courses</Link></Button></CardContent></Card>}
    {query.data?.map((certificate) => <Card key={certificate.id}><CardContent className="flex flex-wrap items-center justify-between gap-5 p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{statusLabel(certificate.status)}</p><h2 className="mt-1 text-lg font-semibold text-slate-950">{certificate.courseTitle}</h2><p className="mt-1 text-sm text-slate-600">Completed {new Date(certificate.completedAt).toLocaleDateString()} · ID {certificate.publicCertificateId}</p></div><div className="flex flex-wrap items-center gap-2"><Button asChild variant="outline"><Link to={`/verify/${certificate.publicCertificateId}`}>Verify</Link></Button>{certificate.status === 'ready' && <Button onClick={async () => { const { url } = await getCertificateDownloadUrl(certificate.id); window.location.assign(url); }}>Download PDF</Button>}</div></CardContent></Card>)}
  </section></main>;
}

export function PublicCertificateVerificationPage() {
  const { publicCertificateId = '' } = useParams();
  const query = useQuery({ queryKey: ['verifyCertificate', publicCertificateId], queryFn: () => verifyCertificate(publicCertificateId), enabled: Boolean(publicCertificateId), retry: false });
  return <main className="min-h-screen bg-paper"><Header title="Certificate verification" eyebrow="Public verification" back="/"/><section className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
    {query.isPending && <Card><CardContent className="p-6 text-sm text-slate-600">Checking certificate…</CardContent></Card>}{query.isError && <Card><CardHeader><CardTitle>Certificate not found</CardTitle><CardDescription>This certificate ID could not be verified.</CardDescription></CardHeader></Card>}
    {query.data && <Card><CardHeader><p className={`text-sm font-semibold uppercase tracking-wider ${query.data.valid ? 'text-emerald-700' : query.data.status === 'revoked' ? 'text-red-700' : 'text-amber-700'}`}>{query.data.status === 'valid' ? 'Valid certificate' : query.data.status === 'revoked' ? 'Revoked certificate' : query.data.status === 'processing' ? 'Certificate is being generated' : 'Certificate unavailable'}</p><CardTitle>{query.data.courseTitle}</CardTitle><CardDescription>Certificate ID: {query.data.certificateId}</CardDescription></CardHeader><CardContent className="space-y-2 text-sm text-slate-700"><p>Awarded to <strong>{query.data.learnerName}</strong></p><p>Completed {new Date(query.data.completedAt).toLocaleDateString()}</p>{query.data.issuedAt && <p>Issued {new Date(query.data.issuedAt).toLocaleDateString()}</p>}</CardContent></Card>}
  </section></main>;
}

export function AdminCertificatesPage() {
  const currentUser = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser });
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(''); const [submittedSearch, setSubmittedSearch] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const rows = useQuery({ queryKey: ['adminCertificates', submittedSearch, status, page], queryFn: () => listAdminCertificates({ q: submittedSearch, status, page }), enabled: Boolean(currentUser.data?.permissions.includes('admin:courses:manage')) });
  const revoke = useMutation({ mutationFn: ({ id, reason }: { id: string; reason: string }) => revokeCertificate(id, reason), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['adminCertificates'] }); } });
  const retry = useMutation({ mutationFn: retryCertificate, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['adminCertificates'] }); } });
  if (currentUser.isPending) return <main className="p-10 text-center">Loading account…</main>;
  if (!currentUser.data) return <Navigate to="/login" replace />;
  if (!currentUser.data.permissions.includes('admin:courses:manage')) return <Navigate to="/dashboard" replace />;
  function submitSearch(event: FormEvent) { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); }
  return <main className="min-h-screen bg-paper"><Header title="Certificates" eyebrow="Administration" back="/admin"/><section className="mx-auto max-w-6xl space-y-5 px-5 py-10 sm:px-8">
    <Card><CardContent className="p-5"><form onSubmit={submitSearch} className="flex flex-wrap gap-3"><input aria-label="Search certificates" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, learner, email, or course" className="min-h-10 min-w-64 flex-1 rounded-lg border border-paper-line-strong px-3 text-sm"/><select aria-label="Certificate status" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} className="min-h-10 rounded-lg border border-paper-line-strong px-3 text-sm"><option value="">All statuses</option>{(['pending', 'processing', 'ready', 'failed', 'revoked'] as CertificateStatus[]).map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select><Button type="submit">Search</Button></form></CardContent></Card>
    {rows.isError && <p role="alert" className="text-sm text-red-700">Certificate records could not be loaded.</p>}{rows.data && <p className="text-sm text-slate-600">{rows.data.total} certificate{rows.data.total === 1 ? '' : 's'}</p>}
    {rows.data?.items.map((certificate) => <Card key={certificate.id}><CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{statusLabel(certificate.status)} · {certificate.publicCertificateId}</p><h2 className="mt-1 font-semibold text-slate-950">{certificate.courseTitle}</h2><p className="text-sm text-slate-600">{certificate.learnerName} · {certificate.email}</p>{certificate.revocationReason && <p className="mt-1 text-sm text-red-700">Revocation reason: {certificate.revocationReason}</p>}</div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to={`/admin/certificates/${certificate.id}`}>Details</Link></Button>{certificate.status === 'failed' && <Button variant="outline" disabled={retry.isPending} onClick={() => retry.mutate(certificate.id)}>Retry generation</Button>}{certificate.status !== 'revoked' && <form className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); revoke.mutate({ id: certificate.id, reason: String(data.get('reason') ?? '') }); }}><input required minLength={10} maxLength={1000} name="reason" placeholder="Reason (10+ characters)" aria-label={`Revocation reason for ${certificate.publicCertificateId}`} className="min-h-10 w-56 rounded-lg border border-paper-line-strong px-3 text-sm"/><Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" disabled={revoke.isPending}>Revoke</Button></form>}</div></CardContent></Card>)}
    {rows.data && <div className="flex items-center justify-between py-3 text-sm text-slate-600"><span>Page {page} of {Math.max(1, Math.ceil(rows.data.total / rows.data.pageSize))} · {rows.data.total} certificates</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= Math.ceil(rows.data.total / rows.data.pageSize)} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
    {(revoke.isError || retry.isError) && <p role="alert" className="text-sm text-red-700">The certificate action failed. Refresh the list and try again.</p>}
  </section></main>;
}
