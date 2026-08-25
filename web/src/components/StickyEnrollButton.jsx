import React from 'react';
const StickyEnrollButton = () => {
  const scrollToPricing = e => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({
        behavior: 'smooth'
      });
    } else {
      window.location.href = '/#pricing';
    }
  };
  return <button onClick={scrollToPricing} className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-6 py-3.5 bg-accent text-primary rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-accent/90 transition-all duration-300 font-bold tracking-wide text-sm border-2 border-primary/10 group">Enroll Now<a href="https://forms.gle/S27eFPLigM2gwumVA" target="_blank" rel="noopener noreferrer" style={{
      textDecoration: "underline"
    }}></a><a href="https://forms.gle/S27eFPLigM2gwumVA" style={{
      textDecoration: "underline"
    }}></a></button>;
};
export default StickyEnrollButton;