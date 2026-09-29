import React, { useEffect, useRef, useState } from 'react';
import { Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { BUSINESS_DATA, SOCIAL_PROFILES } from '@/content/businessData.js';
import { HOME_COPY } from '@/content/sourceContent.js';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu.jsx';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { BRAND_LOGO_SOURCES } from '@/lib/imagePresets.js';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet.jsx';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses/', label: 'Courses' },
  { to: '/blog/', label: 'Insights' },
  { to: '/resources/', label: 'Resources' },
  { to: '/placements/', label: 'Placements' },
  { to: '/about/', label: 'About' },
  { to: '/contact/', label: 'Contact' },
];

const utilityLinks = [
  { href: BUSINESS_DATA.whatsappUrl, label: 'WhatsApp', icon: MessageCircle },
  { href: SOCIAL_PROFILES.linkedin, label: 'LinkedIn', icon: Linkedin },
  { href: SOCIAL_PROFILES.instagram, label: 'Instagram', icon: Instagram },
];

function isNavLinkActive(pathname, link) {
  const normalizedPathname = pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`;
  return link.end ? normalizedPathname === link.to : normalizedPathname.startsWith(link.to);
}

function MobileMenuIcon({ open = false }) {
  return (
    <span className={`site-menu-icon ${open ? 'is-open' : ''}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function BrandLink({ onClick, compact = false }) {
  return (
    <Link to="/" aria-label="Centaur Careers home" onClick={onClick} className="site-brand flex min-w-0 shrink-0 items-center gap-3 rounded-lg">
      <span className={`site-brand-mark flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ${compact ? 'h-10 w-10' : 'h-10 w-10 sm:h-11 sm:w-11'}`}>
        <ResponsiveImage
          src="/images/brand/centaur-careers-logo.jpg"
          alt="Centaur Careers"
          className="h-full w-full object-cover"
          width="1440"
          height="1435"
          sizes={compact ? '40px' : '44px'}
          sources={BRAND_LOGO_SOURCES}
          loading="eager"
        />
      </span>
      <span className={`truncate font-display font-bold leading-tight text-primary ${compact ? 'text-lg' : 'text-base sm:text-xl'}`}>
        Centaur <span className="text-accent-ink">Careers</span>
      </span>
    </Link>
  );
}

function DesktopNavigation({ pathname }) {
  return (
    <NavigationMenu aria-label="Primary navigation" className="hidden lg:flex">
      <NavigationMenuList className="gap-1 space-x-0">
        {navLinks.map((link) => {
          const isActive = isNavLinkActive(pathname, link);
          return (
            <NavigationMenuItem key={link.to}>
              <NavigationMenuLink asChild active={isActive}>
                <Link
                  to={link.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`site-nav-link group relative inline-flex h-11 items-center rounded-lg px-3 text-sm font-semibold ${isActive ? 'is-active text-primary' : 'text-foreground/70 hover:text-primary'}`}
                >
                  {link.label}
                  <span className="site-nav-indicator" aria-hidden="true" />
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const scrollFrameRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const location = useLocation();

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const updateHeaderState = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      setHeaderScrolled(currentScrollY > 16);
      if (currentScrollY <= 16 || scrollDelta < -4) {
        setHeaderHidden(false);
      } else if (scrollDelta > 4) {
        setHeaderHidden(true);
      }

      lastScrollYRef.current = currentScrollY;
      scrollFrameRef.current = null;
    };

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;
      scrollFrameRef.current = window.requestAnimationFrame(updateHeaderState);
    };

    lastScrollYRef.current = window.scrollY;
    updateHeaderState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  return (
    <>
      <div className="site-utility-bar hidden border-b border-white/10 bg-primary text-white lg:block">
        <div className="design-container flex min-h-11 items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-xs font-medium text-white/80">
            <span>{HOME_COPY.headerTraining}</span>
            <span className="text-accent" aria-hidden="true">•</span>
            <span>{HOME_COPY.headerLocation}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium">
            {utilityLinks.map(({ href, label, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="site-utility-link flex min-h-9 items-center gap-1.5 rounded-md px-2 text-white/75 hover:text-accent">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <header data-site-header className={`site-header sticky top-0 z-50 w-full ${headerScrolled ? 'is-scrolled' : ''} ${headerHidden ? 'is-hidden' : ''}`}>
        <div className="site-header-shell design-container grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <BrandLink />

          <div className="hidden justify-center lg:flex">
            <DesktopNavigation pathname={location.pathname} />
          </div>

          <div className="flex items-center justify-end gap-2 lg:col-start-3">
            <a href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="site-header-cta hidden h-11 items-center justify-center rounded-control bg-accent px-5 text-sm font-bold text-primary shadow-sm xl:inline-flex">
              Apply for details
            </a>

            <span id={mobileMenuOpen ? undefined : 'mobile-navigation'} hidden />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button type="button" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="mobile-navigation" aria-expanded={mobileMenuOpen} className="site-menu-trigger inline-flex h-11 w-11 items-center justify-center rounded-control border border-primary/10 bg-primary/5 text-primary lg:hidden">
                  <MobileMenuIcon open={mobileMenuOpen} />
                </button>
              </SheetTrigger>

              <SheetContent closeIcon={<MobileMenuIcon open />} id="mobile-navigation" side="right" className="site-mobile-sheet flex h-dvh w-[min(92vw,26rem)] flex-col overflow-hidden border-l border-primary/10 p-0 sm:max-w-[26rem]">
                <SheetHeader className="border-b border-border/80 px-6 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] text-left">
                  <BrandLink compact onClick={() => setMobileMenuOpen(false)} />
                  <SheetTitle className="sr-only">Primary navigation</SheetTitle>
                  <SheetDescription className="sr-only">{HOME_COPY.headerTraining}. {HOME_COPY.headerLocation}.</SheetDescription>
                </SheetHeader>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
                  <nav aria-label="Mobile navigation">
                    <ul className="space-y-1">
                      {navLinks.map((link, index) => {
                        const isActive = isNavLinkActive(location.pathname, link);
                        return (
                          <li key={link.to} style={{ '--mobile-nav-index': index }} className="site-mobile-nav-item">
                            <SheetClose asChild>
                              <Link
                                to={link.to}
                                aria-current={isActive ? 'page' : undefined}
                                className={`site-mobile-nav-link flex min-h-12 items-center justify-between rounded-control px-4 font-display text-lg font-semibold ${isActive ? 'is-active bg-primary text-white' : 'text-primary hover:bg-primary/5'}`}
                              >
                                {link.label}
                                <span className="site-mobile-nav-marker" aria-hidden="true" />
                              </Link>
                            </SheetClose>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  <div className="mt-auto pt-8">
                    <SheetClose asChild>
                      <a href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="site-mobile-cta inline-flex min-h-14 w-full items-center justify-center rounded-control bg-accent px-6 text-base font-bold text-primary shadow-card">
                        Apply for details
                      </a>
                    </SheetClose>

                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/80 pt-5">
                      {utilityLinks.map(({ href, label, icon: Icon }) => (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="site-mobile-utility flex min-h-11 flex-col items-center justify-center gap-1 rounded-control text-[0.7rem] font-semibold text-foreground/65 hover:bg-primary/5 hover:text-primary">
                          <Icon className="h-4 w-4 text-accent-ink" aria-hidden="true" />
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
