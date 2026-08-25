import React from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function NotFoundPage() {
  const seo = getSeoRoute('not-found');

  return (
    <section className="flex min-h-[65vh] items-center bg-muted py-20">
      <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <Compass className="mx-auto h-14 w-14 text-accent" aria-hidden="true" />
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-accent">404 error</p>
        <h1 className="mt-3 text-4xl font-black text-primary sm:text-5xl">{seo.h1}</h1>
        <p className="mx-auto mt-5 text-lg text-muted-foreground">
          The address may be incorrect or the page may have moved. Use one of the links below to continue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 py-3 font-bold text-primary">Return home</Link>
          <Link to="/courses/" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 py-3 font-bold text-white">Explore courses</Link>
          <Link to="/contact/" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-white px-6 py-3 font-bold text-primary">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
