import React from 'react';

export function SectionHeading({ eyebrow, title, intro, align = 'center', light = false, id }) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';
  return (
    <div className={`mb-10 max-w-3xl ${alignment}`}>
      {eyebrow && <p className={`mb-3 text-sm font-bold uppercase tracking-[0.18em] ${light ? 'text-accent' : 'text-accent-ink'} ${align === 'center' ? 'mx-auto' : ''}`}>{eyebrow}</p>}
      <h2 id={id} className={`text-3xl font-bold sm:text-4xl ${light ? 'text-white' : 'text-primary'}`}>{title}</h2>
      {intro && <p className={`mt-4 text-base sm:text-lg ${light ? 'text-white/70' : 'text-muted-foreground'} ${align === 'center' ? 'mx-auto' : ''}`}>{intro}</p>}
    </div>
  );
}
