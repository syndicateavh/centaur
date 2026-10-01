import { useRef } from 'react';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection } from '@/components/CallToAction.jsx';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { AboutLeadershipSection } from '@/components/home/AboutLeadershipSection.jsx';
import { CareerTracksSection } from '@/components/home/CareerTracksSection.jsx';
import { HiringNetworkSection } from '@/components/home/HiringNetworkSection.jsx';
import { HomeHero } from '@/components/home/HomeHero.jsx';
import { HomeProcessSection } from '@/components/home/HomeProcessSection.jsx';
import { HomeOfferEvidenceSection } from '@/components/home/HomeOfferEvidenceSection.jsx';
import { HomeTestimonialsSection } from '@/components/home/HomeTestimonialsSection.jsx';
import { ProgramBenefitsSection } from '@/components/home/ProgramBenefitsSection.jsx';
import { ProgramFeaturesSection } from '@/components/home/ProgramFeaturesSection.jsx';
import { useHomeMotion } from '@/components/home/useHomeMotion.js';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { HOME_COPY } from '@/content/sourceContent.js';
import { getHomeInternalLinks, HOME_SEO_ROUTE } from '@/seo/homeSeo.js';

export default function SeoHomePage() {
  const seo = HOME_SEO_ROUTE;
  const homeRef = useRef(null);

  useHomeMotion(homeRef);

  return (
    <div ref={homeRef} className="home-page overflow-hidden bg-white">
      <HomeHero seo={seo} />
      <HomeProcessSection />
      <HiringNetworkSection />
      <CareerTracksSection />
      <ProgramFeaturesSection />
      <ProgramBenefitsSection />
      <AboutLeadershipSection />
      <HomeTestimonialsSection />
      <HomeOfferEvidenceSection />
      <InternalLinkGroup links={getHomeInternalLinks()} />
      <div className="home-final-cta" data-home-reveal-container="true" data-home-section="final-cta">
        <div data-home-final-cta-media className="home-final-cta-media" aria-hidden="true">
          <ResponsiveImage
            alt=""
            className="h-full w-full object-cover"
            height={941}
            sizes="100vw"
            sources={[
              { srcSet: '/images/posters/home-final-cta-cohort.avif', type: 'image/avif' },
              { srcSet: '/images/posters/home-final-cta-cohort.webp', type: 'image/webp' },
            ]}
            src="/images/posters/home-final-cta-cohort.jpg"
            width={1672}
          />
        </div>
        <span className="home-final-cta-overlay" aria-hidden="true" />
        <CtaSection
          eyebrow={HOME_COPY.finalCtaEyebrow}
          title={HOME_COPY.finalCtaHeading}
          description={HOME_COPY.finalCtaDescription}
        primaryLabel="Enroll Now — Secure Your Seat"
          secondaryLabel="Chat on WhatsApp"
          secondaryHref={BUSINESS_DATA.whatsappUrl}
        />
      </div>
    </div>
  );
}
