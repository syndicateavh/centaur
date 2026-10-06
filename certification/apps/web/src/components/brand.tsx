import { useEffect, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { SessionUser } from '@centaur/lms-shared';
import { Button } from './ui/button.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.js';
import { logout, loadCurrentUser } from '../lib/auth-api.js';

export function CentaurBrand() {
  return <Link to="/" className="brand-link" aria-label="Centaur Careers Learning home">
    <span className="brand-mark"><img src="/brand/centaur-careers-logo.webp" alt="" width="96" height="96" /></span>
    <span className="brand-name">Centaur <span>Learn</span></span>
  </Link>;
}

const publicLinks = [
  { to: '/courses', label: 'Courses' },
  { to: '/login', label: 'Sign in' },
];

const learnerMenuLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/my-courses', label: 'My courses' },
  { to: '/courses', label: 'Courses' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/profile', label: 'Profile' },
];

export function PublicMenuBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const userQuery = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser, retry: false });
  const user = userQuery.data as SessionUser | undefined;
  const menuLinks = user
    ? [
      ...learnerMenuLinks,
      ...(user.permissions.includes('admin:dashboard:view') ? [{ to: '/admin', label: 'Admin' }] : []),
    ]
    : publicLinks;

  useEffect(() => setOpen(false), [pathname]);

  return <header className="app-header">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="flex min-h-16 items-center justify-between gap-4">
        <CentaurBrand />
        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {menuLinks.map(({ to, label }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return <Link key={to} className={`rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors hover:bg-brand-50 hover:text-brand-800 ${active ? 'text-brand-800' : 'text-slate-700'}`} to={to} aria-current={active ? 'page' : undefined}>{label}</Link>;
          })}
          {user
            ? null
            : <Link className="ml-1 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep" to="/register">Get started</Link>}
        </nav>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-lg border border-paper-line-strong bg-white text-brand-navy transition-colors hover:bg-brand-50 xl:hidden"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="public-mobile-navigation"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>
      <nav id="public-mobile-navigation" aria-label="Mobile navigation" className={`${open ? 'block' : 'hidden'} border-t border-paper-line py-3 xl:hidden`}>
        <div className="grid gap-1">
          {menuLinks.map(({ to, label }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return <Link key={to} className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors hover:bg-brand-50 ${active ? 'bg-brand-50 text-brand-800' : 'text-slate-700'}`} to={to} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link>;
          })}
          {!user && <Link className="mt-1 rounded-lg bg-brand-navy px-3 py-3 text-center text-sm font-semibold text-white hover:bg-brand-deep" to="/register" onClick={() => setOpen(false)}>Get started</Link>}
        </div>
      </nav>
    </div>
  </header>;
}

const learnerLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/my-courses', label: 'My courses' },
  { to: '/courses', label: 'Course catalogue' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/profile', label: 'Profile' },
];

const adminLinks = [
  { section: 'Overview', to: '/admin', label: 'Dashboard', permission: 'admin:dashboard:view' },
  { section: 'Content', to: '/admin/courses', label: 'Courses', permission: 'admin:courses:manage' },
  { section: 'Content', to: '/admin/media', label: 'Media library', permission: 'admin:courses:manage' },
  { section: 'Learners', to: '/admin/students', label: 'Students', permission: 'admin:courses:manage' },
  { section: 'Learners', to: '/admin/enrollments', label: 'Enrollments', permission: 'admin:courses:manage' },
  { section: 'Credentials', to: '/admin/certificates', label: 'Certificates', permission: 'admin:courses:manage' },
  { section: 'Credentials', to: '/admin/audit/certificates', label: 'Certificate audit', permission: 'admin:courses:manage' },
  { section: 'Insights', to: '/admin/analytics', label: 'Analytics', permission: 'admin:courses:manage' },
];

function AdminSidebar({ user, close }: { user: SessionUser; close?: () => void }) {
  const { pathname } = useLocation();
  const visibleLinks = adminLinks.filter(({ permission }) => user.permissions.includes(permission));
  const sections = [...new Set(visibleLinks.map(({ section }) => section))];

  return <div className="flex h-full min-h-0 flex-col bg-white">
    <div className="border-b border-paper-line px-5 py-5"><CentaurBrand /><p className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Administration</p></div>
    <nav aria-label="Administration" className="flex-1 overflow-y-auto px-3 py-5">
      {sections.map((section) => <div key={section} className="mb-5">
        <p className="px-3 pb-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-400">{section}</p>
        <div className="grid gap-1">{visibleLinks.filter((link) => link.section === section).map(({ to, label }) => {
          const active = to === '/admin'
            ? pathname === to
            : pathname === to || pathname.startsWith(`${to}/`);
          return <Link key={to} to={to} onClick={close} aria-current={active ? 'page' : undefined}
            className={`admin-nav-link ${active ? 'admin-nav-link-active' : ''}`}>
            <span className="admin-nav-indicator" aria-hidden="true" />{label}
          </Link>;
        })}</div>
      </div>)}
    </nav>
    <div className="border-t border-paper-line p-4">
      <Link to="/profile" onClick={close} className="block rounded-lg p-2 hover:bg-paper-muted focus-visible:outline-brand-gold">
        <p className="truncate text-sm font-semibold text-brand-navy">{user.displayName || 'Administrator'}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
        <span className="mt-2 block text-xs font-semibold text-brand-700">View profile</span>
      </Link>
    </div>
  </div>;
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const userQuery = useQuery({ queryKey: ['me'], queryFn: loadCurrentUser, retry: false });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData(['me'], null);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await navigate('/', { replace: true });
    },
  });

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  if (userQuery.isPending) return <main className="grid min-h-screen place-items-center bg-paper text-sm text-slate-600">Loading administration…</main>;
  if (userQuery.isError) return <main className="grid min-h-screen place-items-center bg-paper px-5"><Card className="w-full max-w-md"><CardHeader><CardTitle>Admin area unavailable</CardTitle><CardDescription>Your account could not be loaded. Check your connection and try again.</CardDescription></CardHeader><CardContent><Button onClick={() => void userQuery.refetch()}>Try again</Button></CardContent></Card></main>;
  if (!userQuery.data) return <Navigate to="/login" replace />;
  if (!userQuery.data.permissions.some((permission) => permission === 'admin:dashboard:view' || permission === 'admin:courses:manage')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64" aria-label="Admin sidebar"><AdminSidebar user={userQuery.data} /></aside>
    {mobileOpen && <div className="fixed inset-0 z-40 lg:hidden">
      <button type="button" className="absolute inset-0 size-full cursor-default bg-slate-950/40" aria-label="Close administration menu" onClick={() => setMobileOpen(false)} />
      <aside id="admin-mobile-navigation" className="admin-sidebar-mobile relative z-10 h-full w-[min(19rem,86vw)] shadow-2xl" aria-label="Admin navigation"><AdminSidebar user={userQuery.data} close={() => setMobileOpen(false)} /></aside>
    </div>}
    <div className="min-h-screen min-w-0 lg:pl-64">
      <header className="admin-topbar sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-paper-line bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="admin-menu-button inline-flex size-10 items-center justify-center rounded-lg border border-paper-line-strong text-brand-navy hover:bg-paper-muted lg:hidden"
            aria-label={mobileOpen ? 'Close administration menu' : 'Open administration menu'} aria-controls="admin-mobile-navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
          <p className="truncate text-sm font-semibold text-brand-navy lg:hidden">Centaur Learn · Admin</p>
          <p className="hidden truncate text-sm text-slate-500 lg:block">Administration workspace</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/dashboard">Learner view</Link></Button>
          <Button variant="ghost" size="sm" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
            {signOut.isPending ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </header>
      {signOut.isError && <p role="alert" className="border-b border-red-200 bg-red-50 px-5 py-2 text-sm text-red-800">Could not sign out. Please try again.</p>}
      {children}
    </div>
  </div>;
}

export function PortalNav({ admin = false }: { admin?: boolean }) {
  const { pathname } = useLocation();
  const links = admin ? adminLinks : learnerLinks;
  return <nav className="portal-nav -mb-px" aria-label={admin ? 'Administration' : 'Learning portal'}>
    {links.map(({ to, label }) => {
      const active = to === '/courses' ? pathname === to || pathname.startsWith('/courses/') : pathname === to || (to !== '/dashboard' && pathname.startsWith(`${to}/`));
      return <Link key={to} className="portal-nav-link" to={to} aria-current={active ? 'page' : undefined}>{label}</Link>;
    })}
  </nav>;
}
