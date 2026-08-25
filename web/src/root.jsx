import React from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Toaster } from 'sonner';
// Vite resolves stylesheet URL imports during the React Router build.
// eslint-disable-next-line import/no-unresolved
import stylesheet from './index.css?url';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';

export const links = () => [
  { rel: 'stylesheet', href: stylesheet },
  {
    rel: 'icon',
    type: 'image/jpeg',
    href: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/743152148dd3f6734568a106bb709d06.jpg',
  },
];

const gtmBootstrap = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T3QHF5HQ');`;

export function Layout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="generator" content="Centaur Careers" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: gtmBootstrap }} />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="gXEgeRfhxdJoPzl7E8VfyQ"
          async
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T3QHF5HQ"
            height="0"
            width="0"
            title="Google Tag Manager"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
      <FloatingWhatsAppButton />
      <Toaster position="bottom-right" richColors />
    </>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-black text-primary">We could not load this page</h1>
        <p className="mt-4 text-muted-foreground">Please return to the homepage or contact Centaur Careers if the problem continues.</p>
        <a href="/" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-accent px-6 py-3 font-bold text-primary">Return home</a>
      </div>
    </div>
  );
}
