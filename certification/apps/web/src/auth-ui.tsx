import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.js';
import type { UseFormRegisterReturn } from 'react-hook-form';

export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
    <Link to="/" className="mb-8 text-center text-lg font-bold text-slate-950">Centaur <span className="text-sky-700">Learn</span></Link>
    <Card><CardHeader className="p-6 pb-2"><CardTitle className="text-2xl">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="p-6 pt-4">{children}</CardContent></Card>
  </main>;
}

export function FormField({ label, name, type = 'text', error, autoComplete, required = true, registration }: {
  label: string; name: string; type?: string; error?: string | undefined; autoComplete?: string; required?: boolean; registration?: UseFormRegisterReturn;
}) {
  return <label className="block space-y-1.5 text-sm font-medium text-slate-800">{label}
    <input {...registration} name={name} type={type} autoComplete={autoComplete} required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined}
      className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base font-normal outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100" />
    {error && <span id={`${name}-error`} className="block text-sm font-normal text-red-700">{error}</span>}
  </label>;
}

export function FormAlert({ children }: { children: ReactNode }) {
  return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{children}</p>;
}

