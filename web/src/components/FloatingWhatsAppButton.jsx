import React, { useEffect, useState } from 'react';
import { BUSINESS_DATA } from '@/content/businessData.js';

const whatsappMessage = "Hi Centaur Careers! I'm interested in the Financial Operations Masterclass and would like to know more about the program, fees, training, and placement support. Please share the details with me.";
const whatsappNumber = BUSINESS_DATA.telephone.replace(/\D/g, '');

function WhatsAppIcon() {
  return (
    <svg
      className="relative z-10 h-7 w-7 sm:h-8 sm:w-8"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 4.5a11.5 11.5 0 0 0-9.9 17.35L4.7 26.5l4.8-1.27A11.5 11.5 0 1 0 16 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12.2 10.9c.3-.32.78-.34 1.1-.05l1.65 1.55c.32.3.34.8.04 1.12l-.82.88a9.1 9.1 0 0 0 4.42 4.42l.88-.82c.32-.3.82-.28 1.12.04l1.55 1.65c.3.32.27.8-.05 1.1l-.6.55c-.7.65-1.7.88-2.6.57a12.7 12.7 0 0 1-7.54-7.54c-.31-.9-.08-1.9.57-2.6l.28-.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FloatingWhatsAppButton = () => {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { rootMargin: '0px 0px 24px', threshold: 0 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`floating-whatsapp ${footerVisible ? 'is-hidden' : ''}`} aria-hidden={footerVisible}>
      <a
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-link relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-panel sm:h-14 sm:w-14"
        aria-label="Chat on WhatsApp"
        tabIndex={footerVisible ? -1 : undefined}
      >
        <span className="floating-whatsapp-ring absolute inset-0 rounded-full" aria-hidden="true" />
        <WhatsAppIcon />
      </a>
    </div>
  );
};

export default FloatingWhatsAppButton;
