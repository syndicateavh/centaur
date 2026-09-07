import React from 'react';

export function HomeSection({ name, className = '', children, ...props }) {
  return (
    <section
      {...props}
      data-home-section={name}
      data-home-reveal-container="true"
      className={`home-section-deferred ${className}`.trim()}
    >
      {children}
    </section>
  );
}
