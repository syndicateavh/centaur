import { useRef } from 'react';
import { CtaSection } from '@/components/PageShell.jsx';
import { AboutLeadershipSection } from '@/components/home/AboutLeadershipSection.jsx';
import { CareerTracksSection } from '@/components/home/CareerTracksSection.jsx';
import { HiringNetworkSection } from '@/components/home/HiringNetworkSection.jsx';
import { HomeHero } from '@/components/home/HomeHero.jsx';
import { HomeProcessSection } from '@/components/home/HomeProcessSection.jsx';
import { ProgramBenefitsSection } from '@/components/home/ProgramBenefitsSection.jsx';
import { ProgramFeaturesSection } from '@/components/home/ProgramFeaturesSection.jsx';
import { useHomeMotion } from '@/components/home/useHomeMotion.js';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { HOME_COPY } from '@/content/sourceContent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function SeoHomePage() {
  const seo = getSeoRoute('home');
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
      <div data-home-reveal-container="true" data-home-section="final-cta">
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
