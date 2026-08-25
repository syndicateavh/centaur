import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Target, ShieldCheck, Clock, MapPin, Star, Building, CheckCircle2,
  BookOpen, UserCheck, Briefcase, FileText, BadgeCheck, TrendingUp,
  Award, ChevronRight, MessageCircle, Linkedin, Instagram, Phone,
  Mail, ArrowRight, Users, DollarSign, Zap, Globe, Lock, CreditCard,
  Trophy, Gem, BarChart2, Layers, MonitorCheck, Lightbulb, HandshakeIcon,
  GraduationCap, Rocket, RefreshCw, HeartHandshake, Shield, ArrowDown
} from 'lucide-react';
import FAQAccordion from '@/components/FAQAccordion.jsx';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const CERTIFICATE_IMG =
  'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/447def7c7c6151ff20562035a8e91766.png';

const CERTIFICATE_BENEFITS = [
  'Official Course Completion Certificate',
  'Industry-Relevant Skill Validation',
  'Resume & LinkedIn Ready',
  'Demonstrates Practical BFSI Training',
  'Helps Strengthen Job Applications',
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.1, ease: 'easeOut' } })
};

const WHATSAPP = 'https://wa.link/aviltt';
const ENROLL = 'https://forms.gle/S27eFPLigM2gwumVA';

const HIRING_COMPANIES = [
  { name: 'Morgan Stanley', domain: 'morganstanley.com', category: 'Investment Bank' },
  { name: 'Goldman Sachs', domain: 'goldmansachs.com', category: 'Investment Bank' },
  { name: 'JP Morgan', domain: 'jpmorgan.com', category: 'Investment Bank' },
  { name: 'Citi', domain: 'citi.com', category: 'Investment Bank' },
  { name: 'HSBC', domain: 'hsbc.com', category: 'Investment Bank' },
  { name: 'HDFC Bank', domain: 'hdfcbank.com', category: 'Retail Bank' },
  { name: 'ICICI Bank', domain: 'icicibank.com', category: 'Retail Bank' },
  { name: 'Axis Bank', domain: 'axisbank.com', category: 'Retail Bank' },
  { name: 'Kotak Bank', domain: 'kotak.com', category: 'Retail Bank' },
  { name: 'Bajaj Finance', domain: 'bajajfinserv.in', category: 'NBFC' },
  { name: 'HDFC Finance', domain: 'hdfcltd.com', category: 'NBFC' },
  { name: 'Paytm', domain: 'paytm.com', category: 'FinTech' },
  { name: 'PhonePe', domain: 'phonepe.com', category: 'FinTech' },
  { name: 'Razorpay', domain: 'razorpay.com', category: 'FinTech' },
];

const ROLES = [
  { icon: TrendingUp, title: 'Investment Banking Ops', desc: 'Trade Settlements, Reconciliation, Corporate Actions, Fund Accounting', ctc: '₹6–12 LPA' },
  { icon: Building, title: 'Retail Banking', desc: 'Relationship Manager, Branch Ops, Loan Officer, NRI Banking', ctc: '₹3–6 LPA' },
  { icon: Lock, title: 'KYC / AML Compliance', desc: 'Due Diligence, Transaction Monitoring, SAR Filing, Regulatory Reporting', ctc: '₹4–8 LPA' },
  { icon: CreditCard, title: 'Digital Payments', desc: 'SWIFT, RTGS, UPI/IMPS Ops, Payment Disputes, Wallet Reconciliations', ctc: '₹4–8 LPA' },
  { icon: FileText, title: 'Finance Operations', desc: 'NBFC, Loan Processing, Credit Analysis, Risk Management', ctc: '₹3–6 LPA' },
  { icon: Globe, title: 'FinTech & Neo-Banking', desc: 'Digital Lending, Product Ops, Compliance Analyst, Customer Success', ctc: '₹5–10 LPA' },
];

const WHY_US = [
  { icon: ShieldCheck, title: '100% Placement Guarantee', desc: 'Full fee refund if you meet all criteria and we fail to place you within 180 days. Student-first, always.', highlight: true },
  { icon: Briefcase, title: '105+ Live Finance Roles', desc: 'Access to roles across Investment Banking, Retail Banking, NBFC, FinTech, and Compliance sectors.', emphasis: '105+' },
  { icon: Clock, title: '6-Week Intensive Masterclass', desc: 'Practical, scenario-based curriculum replacing theory with real banking case studies from JP Morgan, Citi, HSBC.', boldPrefix: '6-Week ' },
  { icon: Globe, title: 'Pan-India Placement Network', desc: 'Access to finance roles nationwide — Mumbai, Bengaluru, Pune, Delhi/NCR, Hyderabad, and beyond.' },
  { icon: UserCheck, title: 'Expert Industry Mentors', desc: '15+ years of combined banking experience. Direct mentorship from practitioners, not academics.' },
  { icon: Star, title: 'Unlimited Interview Support', desc: 'Up to 8 interview opportunities with offer negotiation, mock interviews, and coaching.' },
];

const BENEFITS = [
  { icon: Award, title: 'Day-One Job Readiness', desc: 'Industry-standard skills, real banking scenarios, and assessed competencies that make you interview-ready from week one.' },
  { icon: Users, title: 'Structured Placement Support', desc: 'Resume building, LinkedIn optimization, mock interviews, behavioral rounds, corporate vivas, and offer negotiation.' },
  { icon: Target, title: 'Salary of ₹3–12 LPA', desc: 'Targeted CTC range aligned with top private banks and global financial institutions.' },
  { icon: Globe, title: 'Pan-India Deployment', desc: 'Placements across India\'s top financial hubs: Mumbai, Bengaluru, Pune, Delhi/NCR, Hyderabad, and more — wherever your career takes you.' },
  { icon: Zap, title: 'Fast-Track Career Entry', desc: 'Avoid the years of rejections. Go from graduate to corporate finance professional in just 6 weeks.' },
  { icon: BookOpen, title: 'Certification & Alumni Network', desc: 'Program certificate, access to our alumni network, and continued placement support even after deployment.' },
];

const HTD_STEPS = [
  {
    step: '01', label: 'HIRE', title: 'Candidate Selection',
    desc: 'We evaluate and onboard motivated BBA, BCom, and MBA graduates who are serious about building a finance career. No prior banking experience required — just ambition and commitment.',
    points: ['Graduate / Final-year eligible', 'Aptitude & motivation screening', 'Career counselling session', 'Personalised learning roadmap']
  },
  {
    step: '02', label: 'TRAIN', title: '6-Week Finance Masterclass',
    desc: 'An intensive, 100% practical curriculum covering every pillar of corporate finance — from trade settlements and AML compliance to retail banking and digital payments.',
    points: ['Live banking case studies', 'KYC, AML, Trade Lifecycle', 'Mock interviews & corporate vivas', 'Weekly assessments & tier ranking']
  },
  {
    step: '03', label: 'DEPLOY', title: 'Guaranteed Placement',
    desc: 'We connect trained students directly with our hiring partners. You get interview line-ups, offer negotiation support, and continued assistance until you land your role.',
    points: ['Direct employer connect', '105+ roles across India', 'Offer negotiation support', '100% fee refund guarantee (T&C)']
  },
];

const FAQS = [
  { question: 'Who is eligible for the program?', answer: 'This program is open to graduates from any field, including BBA, BCom, BA, BSc, BTech, and MBA (final-year students can also apply). You don\'t need a finance background — we start from fundamentals and train you to become job-ready for finance roles.' },
  { question: 'What is the placement guarantee exactly?', answer: 'If you meet Platinum/Gold criteria (85%+ attendance, all assessments, all mock interviews, attend drives) but are not placed within 180 days of completion, we refund 100% of your fee as per the Guarantee Terms.' },
  { question: 'What is the difference between Online and Offline modes?', answer: 'Both Online and Offline programs are LIVE, instructor-led training with the same curriculum, mentorship, and placement support.\n\nThe Online program (₹35,000) is designed for flexibility — you can attend live classes from anywhere without compromising on learning or outcomes.\n\nThe Offline program (₹50,000) offers the same live training in an in-person environment at Mindsprout Careers Hub, Lucknow, with added benefits like face-to-face interaction, structured routine, and peer networking.\n\nNo matter which mode you choose, the training quality, support, and career outcomes remain the same — only the learning experience differs.' },
  { question: 'How many interview opportunities do I get?', answer: 'Up to 8 distinct interview opportunities. If all 8 are exhausted without placement, a remock assessment is conducted to identify gaps and resume the process.' },
  { question: 'Can I choose which city I want to work in?', answer: 'Yes. We support placements across Mumbai, Bengaluru, Pune, Delhi/NCR, and Hyderabad. Lucknow students can also access hometown Retail Banking and NBFC roles.' },

  { question: 'What happens after I get placed?', answer: 'Your placement journey does not end at offer acceptance. We provide onboarding guidance, post-placement check-ins, and access to our alumni network for continued career growth.' },
];

const NETWORK_LOGOS = [
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/21b1b3b20ab95137071d1ee1f6343d80.webp', alt: 'Citi' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/a3b5a2cf91e4e76a0155e0abd8cbb86a.webp', alt: 'Axis Bank' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/475cf55944bae74bed68a5ec355fab70.webp', alt: 'Deutsche Bank' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/54ada0b1ceccbcc60266ef100a7f8548.webp', alt: 'Goldman Sachs' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/18fbb178b8e53fe5cbe73a9944d81cde.webp', alt: 'HDFC Bank' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/589471a8ac1a3c6cec6e97a088d79e96.webp', alt: 'HSBC' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/9865df2052ef1344720632a8bab1e844.webp', alt: 'ICICI Bank' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/9cbcf3c6abd6a0fcd8e3c1d477da21c4.webp', alt: 'J.P. Morgan' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/f7cd68dfd6055dac06ca03f74488a8d7.webp', alt: 'Morgan Stanley' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/f824ffccea0c69a4809c38629e28fb3f.webp', alt: 'Standard Chartered' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/24d4f9a8bda5a676a47975955338741d.webp', alt: 'Barclays' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/e2292328fe25eeecdc571a19a336bdd9.webp', alt: 'KPMG' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/186827bb6594f3f3f609a4e622b85224.webp', alt: 'Deloitte' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/afe132bccb1189693adbf2c763c1d445.webp', alt: 'PwC' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/7c570acd4d8176dec9b137da147c77d2.webp', alt: 'Societe Generale' },
  { src: 'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/919cd0ce5a1396ff9633aa498a8beaef.webp', alt: 'State Street' },
];

function LogoHiringCarousel() {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, startOffset: 0, moved: false });
  const pausedRef = useRef(false);
  const halfWidthRef = useRef(0);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);

  const applyTransform = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    let half = halfWidthRef.current;
    if (!half) {
      half = el.scrollWidth / 2;
      halfWidthRef.current = half;
    }
    if (half > 0) {
      while (offsetRef.current <= -half) offsetRef.current += half;
      while (offsetRef.current > 0) offsetRef.current -= half;
    }
    el.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  }, []);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) halfWidthRef.current = trackRef.current.scrollWidth / 2;
    };
    measure();
    window.addEventListener('resize', measure);
    const imgs = trackRef.current?.querySelectorAll('img') || [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    });

    const SPEED = 36; // px per second — slow premium crawl
    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(48, ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (!pausedRef.current && !dragRef.current.active) {
        offsetRef.current -= SPEED * dt;
        applyTransform();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', measure);
    };
  }, [applyTransform]);

  const onPointerDown = (e) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startOffset: offsetRef.current,
      moved: false,
    };
    pausedRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    offsetRef.current = dragRef.current.startOffset + dx;
    applyTransform();
  };

  const endDrag = (e) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    pausedRef.current = false;
    lastTsRef.current = 0;
  };

  const loop = [...NETWORK_LOGOS, ...NETWORK_LOGOS];

  return (
    <div
      className="network-logo-carousel relative w-full select-none"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => {
        if (!dragRef.current.active) pausedRef.current = false;
      }}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        touchAction: 'pan-y',
      }}
    >
      <style>{`
        .network-logo-carousel .logo-card {
          flex: 0 0 auto;
          width: clamp(148px, 42vw, 188px);
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #e8eaed;
          border-radius: 10px;
          padding: 14px 18px;
          box-shadow: 0 1px 3px rgba(10, 25, 49, 0.04);
          margin-right: 14px;
        }
        @media (min-width: 640px) {
          .network-logo-carousel .logo-card {
            width: clamp(160px, 22vw, 190px);
            height: 92px;
            margin-right: 16px;
          }
        }
        @media (min-width: 1024px) {
          .network-logo-carousel .logo-card {
            width: 178px;
            height: 96px;
            margin-right: 18px;
          }
        }
        .network-logo-carousel .logo-card img {
          width: 100%;
          height: 100%;
          max-height: 52px;
          object-fit: contain;
          object-position: center;
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .network-logo-carousel [data-track] {
            transform: none !important;
          }
        }
      `}</style>
      <div
        className="overflow-hidden py-1"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="region"
        aria-label="Hiring partner logos"
      >
        <div
          ref={trackRef}
          data-track
          className="flex w-max will-change-transform"
          style={{ cursor: 'grab' }}
        >
          {loop.map(({ src, alt }, i) => (
            <div key={`${alt}-${i}`} className="logo-card" aria-hidden={i >= NETWORK_LOGOS.length}>
              <img src={src} alt={i < NETWORK_LOGOS.length ? alt : ''} loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [certOpen, setCertOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background font-sans text-foreground">

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-auto overflow-hidden bg-[#0A1931] flex flex-col justify-center py-16 sm:py-20 lg:py-28">
        {/* Background layers */}
        <div className="absolute inset-0">
          <img
            src="https://images.hostinger.com/a2487955-8e60-40e8-a363-fbdbb0a865eb.png"
            alt=""
            className="h-full w-full object-cover object-center opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1931] via-[#0A1931]/95 to-[#0c2040]" />
          {/* Gold radial accent */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/8 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        {/* Main hero content */}
        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5">

            {/* ── LEFT: Main Copy (3/5) ── */}
            <motion.div className="flex flex-col items-start lg:col-span-3" variants={fadeUp} initial="hidden" animate="visible">

              {/* Urgency pill */}
              <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
                className="mb-6 flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-red-300">Limited Seats — Next Batch Filling Fast</span>
              </motion.div>

              {/* Pain-point hook */}
              <motion.p variants={fadeUp} custom={0.5} initial="hidden" animate="visible"
                className="mb-4 text-base font-semibold text-[#D4AF37]/80 tracking-wide">
                Struggling to land a finance job after graduation?
              </motion.p>

              {/* Main headline */}
              <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
                className="font-poppins text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Get a{' '}
                <span className="relative inline-block">
                  <span className="text-[#D4AF37]">₹3–12 LPA</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4AF37]/50 rounded-full" />
                </span>
                <br />
                <span className="text-white/90">Finance Job in 6 Weeks</span>
              </motion.h1>

              {/* Subheading — 3 key bullet points */}
              <motion.div variants={fadeUp} custom={1.5} initial="hidden" animate="visible"
                className="mt-6 max-w-2xl space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-black text-[#0A1931]">✓</span>
                  <p className="text-base text-white/80 sm:text-lg leading-snug"><strong className="text-white font-bold">Hire → Train → Deploy:</strong> Proven model that selects motivated graduates, trains them intensively, and deploys them directly to top employers.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-black text-[#0A1931]">✓</span>
                  <p className="text-base text-white/80 sm:text-lg leading-snug"><strong className="text-white font-bold">6-Week Intensive Masterclass:</strong> Practical BFSI curriculum covering trade settlements, compliance, retail banking, and digital payments — no theory, only real banking scenarios.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-black text-[#0A1931]">✓</span>
                  <p className="text-base text-white/80 sm:text-lg leading-snug"><strong className="text-white font-bold">100% Placement Guarantee:</strong> Access to 105+ finance roles across India. Full fee refund if we fail to place you within 180 days.</p>
                </div>
              </motion.div>

              {/* How it works — 3-step inline */}
              <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible"
                className="mt-7 flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
                {[
                  { num: '01', title: 'Get Selected', detail: 'Apply & screening' },
                  { num: '02', title: '6-Week Masterclass', detail: 'Live banking training' },
                  { num: '03', title: 'Get Placed', detail: '₹3–12 LPA roles' },
                ].map(({ num, title, detail }, i) => (
                  <div key={num} className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37] font-poppins text-xs font-black text-[#0A1931]">{num}</span>
                    <div>
                      <p className="font-poppins text-sm font-bold text-white leading-tight">{title}</p>
                      <p className="text-xs text-white/50">{detail}</p>
                    </div>
                    {i < 2 && <ArrowRight className="hidden sm:block ml-auto h-4 w-4 text-[#D4AF37]/40 flex-shrink-0" />}
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div variants={fadeUp} custom={2.5} initial="hidden" animate="visible"
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center w-full max-w-lg">
                {/* Primary CTA: Gold background with navy text */}
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                  className="group relative inline-flex h-14 flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#D4AF37] px-8 font-poppins text-base font-bold text-[#0A1931] shadow-lg shadow-[#D4AF37]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/50 hover:-translate-y-0.5 active:scale-95">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Apply Now on WhatsApp
                </a>
                
                {/* Secondary CTA: Outlined style */}
                <a href={ENROLL} target="_blank" rel="noopener noreferrer"
                  className="group relative inline-flex h-14 flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-white/30 bg-white/5 px-8 font-poppins text-base font-bold text-white transition-all duration-300 hover:border-[#D4AF37]/60 hover:bg-white/10 hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm">
                  <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  Enroll Now
                </a>
              </motion.div>

              {/* Trust micro-signals */}
              <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible"
                className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/45">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#D4AF37]" /> 100% Placement Guarantee</span>
                <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-[#D4AF37]" /> 100+ Students Placed</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#D4AF37]" /> Lucknow + Pan-India Roles</span>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Visual card (2/5) ── */}
            <motion.div className="hidden lg:flex lg:col-span-2 flex-col gap-4" variants={fadeUp} custom={1.5} initial="hidden" animate="visible">
              {/* Hero image card */}
              <div className="relative overflow-hidden rounded-3xl border border-[#D4AF37]/20 shadow-2xl">
                <img
                  src="https://darkgray-grouse-956867.hostingersite.com/wp-content/uploads/2026/07/ChatGPT-Image-Jul-26-2026-01_44_39-AM-1.png"
                  alt="Finance career training"
                  className="w-full object-cover object-top"
                  style={{ aspectRatio: '3/4' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1931] via-[#0A1931]/20 to-transparent" />

                {/* Salary badge */}
                <div className="absolute top-4 left-4 rounded-2xl border border-[#D4AF37]/40 bg-[#0A1931]/90 px-4 py-3 backdrop-blur-md">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]/80">Target Salary</p>
                  <p className="font-poppins text-2xl font-black text-white">₹3–12 LPA</p>
                </div>

                {/* Hiring partners strip */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0A1931]/95 p-4 backdrop-blur-md">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Our Hiring Partners</p>
                    <div className="grid grid-cols-4 gap-2">
                      {HIRING_COMPANIES.slice(0, 8).map(({ name, domain }) => (
                        <div key={name} className="flex h-9 items-center justify-center rounded-lg bg-white/10 p-1.5 transition hover:bg-white/20">
                          <img
                            src={`https://logo.clearbit.com/${domain}`}
                            alt={name}
                            className="max-h-full max-w-full object-contain brightness-0 invert"
                            onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                          />
                          <span className="hidden text-[8px] font-bold text-white/70 text-center leading-tight">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat pills row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: DollarSign, text: '₹3–12 LPA', sub: 'Target LPA' },
                  { icon: Briefcase, text: '105+', sub: 'Roles' },
                  { icon: Clock, text: '6 Wks', sub: 'Program' },
                ].map(({ icon: Icon, text, sub }) => (
                  <div key={text} className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 py-3 text-center backdrop-blur-sm">
                    <Icon className="mb-1 h-4 w-4 text-[#D4AF37]" />
                    <span className="font-poppins text-base font-black text-white">{text}</span>
                    <span className="text-[10px] text-white/45">{sub}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scrolling marquee */}
        <div className="relative z-10 overflow-hidden border-t border-[#D4AF37]/20 bg-[#D4AF37]/5 py-3 mt-8 sm:mt-10 lg:mt-12">
          <motion.div className="flex w-max items-center gap-8"
            animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, ease: 'linear', repeat: Infinity }}>
            {[...HIRING_COMPANIES, ...HIRING_COMPANIES].map((c, i) => (
              <div key={i} className="flex h-8 w-24 flex-shrink-0 items-center justify-center px-2">
                <img
                  src={`https://logo.clearbit.com/${c.domain}`}
                  alt={c.name}
                  className="max-h-7 max-w-full object-contain brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="hidden text-xs font-semibold text-[#D4AF37]/70 whitespace-nowrap">{c.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* ── ABOUT US ── */}
      <section id="about" className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A1931]">About Centaur Careers</span>
            <h2 className="font-poppins text-3xl font-bold leading-tight text-[#0A1931] sm:text-4xl md:text-5xl">
              Bridging the Gap Between Graduates and High-Paying Finance Careers
            </h2>
            <p className="mt-8 text-base leading-relaxed text-muted-foreground">
              We transform graduates into day-one ready finance professionals through our proven Hire-Train-Deploy model. In just 6 weeks, you'll master real banking operations, land interviews with top BFSI companies, and secure a role paying ₹3–12 LPA — or we refund your entire fee.
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Founded by banking veterans with 15+ years of industry experience, we've placed 100+ graduates across Investment Banking, Retail Banking, NBFCs, and FinTech. Your success is our guarantee.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <a href={ENROLL} target="_blank" rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0A1931] px-7 font-poppins text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#112240]">
                Enroll Now
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#0A1931]/20 px-7 font-poppins text-sm font-bold text-[#0A1931] transition hover:bg-[#0A1931]/5">
                Talk to Advisor
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HIRE TRAIN DEPLOY ── */}
      <section id="services" className="py-20 lg:py-28" style={{ background: 'linear-gradient(180deg, #0A1931 0%, #071422 100%)' }}>
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-16 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Our Process</span>
            <h2 className="font-poppins text-3xl font-bold text-white sm:text-4xl md:text-5xl">From Applicant to Placed — In 3 Steps</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">One clear path. One outcome: your first ₹3–12 LPA finance job.</p>
          </motion.div>

          {/* Step flow — desktop: 3 equal columns with arrow separators; mobile: stacked */}
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_72px_1fr_72px_1fr] lg:items-stretch">

            {/* ── STEP 01 ── */}
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:bg-white/[0.07]">
              {/* Step label + icon */}
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37]/50 bg-[#D4AF37]/10">
                  <BadgeCheck className="h-6 w-6 text-[#D4AF37]" strokeWidth={2} />
                </div>
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/60">Step 01</p>
                  <h3 className="font-poppins text-2xl font-black leading-tight text-white">Get Selected</h3>
                </div>
              </div>
              {/* Sub-label */}
              <p className="mb-6 text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]/70">Application &amp; Screening</p>
              {/* Bullets */}
              <ul className="flex-1 space-y-4">
                {[
                  'Submit your profile via WhatsApp or form',
                  'Free counselling call with our advisor',
                  'Finance track matching — IB / Retail / Ops',
                  'Seat confirmation &amp; fee payment',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20">
                      <CheckCircle2 className="h-3 w-3 text-[#D4AF37]" strokeWidth={2.5} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-white/80" dangerouslySetInnerHTML={{ __html: pt }} />
                  </li>
                ))}
              </ul>
              <div className="mt-8 h-px w-full rounded-full bg-[#D4AF37]/25 transition-colors duration-300 group-hover:bg-[#D4AF37]/50" />
            </motion.div>

            {/* ── ARROW 1 — desktop ── */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-0 px-2">
              <div className="flex-1 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-[#D4AF37]/30" />
              <div className="flex items-center gap-0">
                <div className="h-px w-4 bg-[#D4AF37]/40" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4AF37]/50 bg-[#D4AF37]/10">
                  <ArrowRight className="h-5 w-5 text-[#D4AF37]" strokeWidth={2.5} />
                </div>
                <div className="h-px w-4 bg-[#D4AF37]/40" />
              </div>
              <div className="flex-1 w-px bg-gradient-to-b from-[#D4AF37]/30 via-[#D4AF37]/30 to-transparent" />
            </div>
            {/* Mobile arrow */}
            <div className="flex lg:hidden justify-center py-5">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-5 bg-[#D4AF37]/40" />
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#D4AF37]/50 bg-[#D4AF37]/10">
                  <ArrowDown className="h-4 w-4 text-[#D4AF37]" strokeWidth={2.5} />
                </div>
                <div className="w-px h-5 bg-[#D4AF37]/40" />
              </div>
            </div>

            {/* ── STEP 02 ── */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-9 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40 hover:bg-white/[0.07]">
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37]/50 bg-[#D4AF37]/10">
                  <BookOpen className="h-6 w-6 text-[#D4AF37]" strokeWidth={2} />
                </div>
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/60">Step 02</p>
                  <h3 className="font-poppins text-2xl font-black leading-tight text-white">6-Week Training</h3>
                </div>
              </div>
              <p className="mb-6 text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]/70">Intensive BFSI Masterclass</p>
              <ul className="flex-1 space-y-4">
                {[
                  'IB Ops, Retail Banking &amp; Finance Operations',
                  'KYC / AML, Digital Payments, Corporate Readiness',
                  'Weekly live mock interviews &amp; tier ranking',
                  'Role-specific projects &amp; case studies',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20">
                      <CheckCircle2 className="h-3 w-3 text-[#D4AF37]" strokeWidth={2.5} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-white/80" dangerouslySetInnerHTML={{ __html: pt }} />
                  </li>
                ))}
              </ul>
              <div className="mt-8 h-px w-full rounded-full bg-[#D4AF37]/25 transition-colors duration-300 group-hover:bg-[#D4AF37]/50" />
            </motion.div>

            {/* ── ARROW 2 — desktop ── */}
            <div className="hidden lg:flex flex-col items-center justify-center gap-0 px-2">
              <div className="flex-1 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-[#D4AF37]/30" />
              <div className="flex items-center gap-0">
                <div className="h-px w-4 bg-[#D4AF37]/40" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#D4AF37]/60 bg-[#D4AF37]/15">
                  <ArrowRight className="h-5 w-5 text-[#D4AF37]" strokeWidth={2.5} />
                </div>
                <div className="h-px w-4 bg-[#D4AF37]/40" />
              </div>
              <div className="flex-1 w-px bg-gradient-to-b from-[#D4AF37]/30 via-[#D4AF37]/30 to-transparent" />
            </div>
            {/* Mobile arrow */}
            <div className="flex lg:hidden justify-center py-5">
              <div className="flex flex-col items-center gap-1">
                <div className="w-px h-5 bg-[#D4AF37]/40" />
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#D4AF37]/60 bg-[#D4AF37]/15">
                  <ArrowDown className="h-4 w-4 text-[#D4AF37]" strokeWidth={2.5} />
                </div>
                <div className="w-px h-5 bg-[#D4AF37]/40" />
              </div>
            </div>

            {/* ── STEP 03 — highlighted / larger ── */}
            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="relative flex flex-col rounded-2xl border-2 border-[#D4AF37]/70 p-10 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.07) 60%, rgba(10,25,49,0.6) 100%)',
                boxShadow: '0 0 60px rgba(212,175,55,0.25), 0 0 120px rgba(212,175,55,0.10), inset 0 1px 0 rgba(212,175,55,0.25)',
              }}>
              {/* Badge above card */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-5 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#0A1931] shadow-lg shadow-[#D4AF37]/30">
                  <Star className="h-3 w-3 fill-[#0A1931]" strokeWidth={0} />
                  Guaranteed Result
                </span>
              </div>
              <div className="mb-7 mt-3 flex items-center gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]" style={{ boxShadow: '0 0 20px rgba(212,175,55,0.5)' }}>
                  <Briefcase className="h-7 w-7 text-[#0A1931]" strokeWidth={2} />
                </div>
                <div>
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Step 03</p>
                  <h3 className="font-poppins text-2xl font-black leading-tight text-white">Get Placed</h3>
                </div>
              </div>
              <p className="mb-6 text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">Guaranteed Placement</p>
              <ul className="flex-1 space-y-4">
                {[
                  'Direct access to multiple BFSI hiring partners',
                  'Up to 8 interview opportunities guaranteed',
                  '100+ roles across banking &amp; finance',
                  '100% fee refund if unplaced after 180 days',
                ].map((pt) => (
                  <li key={pt} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]" style={{ boxShadow: '0 0 8px rgba(212,175,55,0.4)' }}>
                      <CheckCircle2 className="h-3 w-3 text-[#0A1931]" strokeWidth={2.5} />
                    </span>
                    <span className="text-[15px] font-medium leading-relaxed text-white/95" dangerouslySetInnerHTML={{ __html: pt }} />
                  </li>
                ))}
              </ul>
              <div className="mt-8 h-1 w-full rounded-full bg-gradient-to-r from-[#D4AF37]/60 via-[#D4AF37] to-[#D4AF37]/60" />
            </motion.div>
          </div>

          {/* CTA below section */}
          <motion.div className="mt-16 flex flex-col items-center gap-3 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <a
              href="https://forms.gle/S27eFPLigM2gwumVA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl bg-[#D4AF37] px-12 py-4 font-poppins text-base font-bold text-[#0A1931] shadow-lg transition-all duration-200 hover:bg-[#c9a42e] hover:shadow-[0_0_40px_rgba(212,175,55,0.45)] active:scale-[0.98]"
            >
              Start Your Application
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </a>
            <p className="text-sm text-white/50">
              <span className="text-[#D4AF37]/70 font-semibold">Limited seats available</span>
              {' '}•{' '}
              Free counselling call included
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHY WE'RE DIFFERENT ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-16 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A1931]">Comparison</span>
            <h2 className="font-poppins text-3xl font-bold text-[#0A1931] sm:text-4xl md:text-5xl">Why We're Different</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">Most programs teach theory. We focus on getting you hired.</p>
          </motion.div>

          {/* 2-Column Comparison Table */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-[#0A1931]/10 bg-white shadow-lg">
            
            {/* Header Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Others Column Header */}
              <div className="border-r border-[#0A1931]/10 bg-muted/40 p-8 md:p-10">
                <p className="font-poppins text-lg font-bold text-muted-foreground/60">Others</p>
              </div>
              
              {/* Centaur Careers Column Header */}
              <div className="bg-[#0A1931]/3 p-8 md:p-10 border-l border-[#0A1931]/10">
                <div className="flex items-center gap-3">
                  <p className="font-poppins text-lg font-bold text-[#0A1931]">Centaur Careers</p>
                  <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0A1931]">Better</span>
                </div>
              </div>
            </div>

            {/* Comparison Rows */}
            {[
              { others: 'Theory-based learning', centaur: 'Job-ready practical skills' },
              { others: 'No real interview exposure', centaur: 'Direct interview opportunities' },
              { others: 'Generic curriculum', centaur: 'Industry-relevant training' },
              { others: 'Limited placement support', centaur: 'Dedicated placement assistance' },
              { others: 'Outdated teaching methods', centaur: 'Real-world case-based learning' },
              { others: 'No hiring connections', centaur: 'Strong employer network' },
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-[#0A1931]/10">
                {/* Others Column */}
                <div className="border-r border-[#0A1931]/10 bg-white p-6 md:p-8 flex items-center gap-3">
                  <span className="text-lg text-muted-foreground/40 flex-shrink-0">✕</span>
                  <p className="text-sm text-muted-foreground/70">{row.others}</p>
                </div>

                {/* Centaur Careers Column */}
                <div className="bg-[#0A1931]/2 p-6 md:p-8 flex items-center gap-3 border-l border-[#0A1931]/10">
                  <span className="text-lg text-[#D4AF37] flex-shrink-0">✓</span>
                  <p className="text-sm font-medium text-[#0A1931]">{row.centaur}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Section - Matches comparison table width */}
          <motion.div className="mt-12 rounded-2xl border border-[#0A1931]/10 bg-[#0A1931] p-8 md:p-10 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex flex-col items-center">
              <p className="font-poppins text-xl md:text-2xl font-bold text-white mb-3">Ready to Get Hired?</p>
              <p className="text-sm md:text-base text-white/70 max-w-2xl mb-8">Join hundreds of graduates who chose Centaur Careers and landed their dream finance role.</p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                <a href={ENROLL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-11 items-center rounded-xl bg-[#D4AF37] px-7 font-poppins text-sm font-bold text-[#0A1931] shadow-lg shadow-[#D4AF37]/30 transition hover:-translate-y-0.5 hover:bg-[#c9a227]">
                  Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-11 items-center rounded-xl border border-white/15 bg-white/8 px-7 font-poppins text-sm font-bold text-white/80 transition hover:bg-white/15 hover:text-white">
                  <MessageCircle className="mr-2 h-4 w-4 text-green-400" /> Talk to Advisor
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUSTED HIRING NETWORK ── */}
      <section className="bg-white border-t border-gray-100 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-8">

          {/* Heading */}
          <motion.div
            className="mb-8 text-center sm:mb-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#0A1931]">
              Hiring Network
            </span>
            <h2 className="mt-3 font-poppins text-3xl font-bold leading-tight text-[#0A1931] sm:text-4xl md:text-[2.75rem]">
              Trusted Hiring Network
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-[#0A1931]/50">
              200+ Leading Companies Across Banking, NBFCs &amp; FinTech
            </p>
            <div
              className="mx-auto mt-5 h-[3px] w-14 rounded-full"
              style={{ background: 'linear-gradient(90deg, #D4AF37, #f0d060)' }}
            />
          </motion.div>

          {/* Logo carousel */}
          <LogoHiringCarousel />

          {/* Stats bar */}
          <motion.div
            className="mt-10 flex flex-row flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:mt-12 sm:gap-x-14 lg:gap-x-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex min-w-[7.5rem] flex-col items-center gap-1">
              <span className="text-3xl font-bold text-[#0A1931]" style={{ fontFamily: 'Poppins, sans-serif' }}>200+</span>
              <span className="text-sm tracking-wide text-[#0A1931]/50">Partner Companies</span>
            </div>
            <div className="hidden h-10 w-px bg-gray-200 sm:block" aria-hidden="true" />
            <div className="flex min-w-[7.5rem] flex-col items-center gap-1">
              <span className="text-3xl font-bold text-[#0A1931]" style={{ fontFamily: 'Poppins, sans-serif' }}>100+</span>
              <span className="text-sm tracking-wide text-[#0A1931]/50">Students Placed</span>
            </div>
            <div className="hidden h-10 w-px bg-gray-200 sm:block" aria-hidden="true" />
            <div className="flex min-w-[7.5rem] flex-col items-center gap-1">
              <span className="text-3xl font-bold text-[#D4AF37]" style={{ fontFamily: 'Poppins, sans-serif' }}>3–12 LPA</span>
              <span className="text-sm tracking-wide text-[#0A1931]/50">Average CTC Range</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── ROLES OFFERED ── */}
      <section id="programs" className="py-20 lg:py-24 bg-muted/40">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-12 flex flex-col items-center text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-3 inline-block rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A1931]">105+ Finance Roles</span>
            <h2 className="font-poppins text-3xl font-bold text-[#0A1931] sm:text-4xl" style={{ maxWidth: '32rem' }}>Finance Career Tracks We Offer</h2>
            <p className="mt-3 text-[15px] text-muted-foreground" style={{ maxWidth: '32rem' }}>Specialised tracks aligned to the most in-demand BFSI functions. Pick your path; we'll train and place you.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map(({ icon: Icon, title, desc, ctc }, idx) => (
              <motion.div key={title} variants={fadeUp} custom={idx % 3} initial="hidden" whileInView="visible" viewport={{ once: true }}
                style={{ borderRadius: '12px', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
                className="group flex flex-col bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.07)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}>
                {/* Icon */}
                <div className="mb-4 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[#0A1931]" style={{ background: 'rgba(10,25,49,0.07)' }}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                {/* Title */}
                <h3 className="font-poppins text-[15px] font-bold leading-snug text-[#0A1931]">{title}</h3>
                {/* Description — capped at 2 lines */}
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">{desc}</p>
                {/* Salary badge — full width, left-aligned, consistent */}
                <div className="mt-5 flex h-9 min-h-9 items-center whitespace-nowrap rounded-md px-3 text-[13px] font-bold text-[#0A1931]" style={{ background: 'rgba(212,175,55,0.14)', width: '100%' }}>
                  {ctc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section id="why" className="py-20 lg:py-24" style={{ background: 'linear-gradient(160deg, #0d1f3c 0%, #0f2247 60%, #0d1f3c 100%)' }}>
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-12 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Why Centaur Careers</span>
            <h2 className="font-poppins text-3xl font-bold text-white sm:text-4xl md:text-5xl mt-3">Built for Students Who Mean Business</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/50">We don't just train — we place. Every feature of our program is designed around one outcome: your employment.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {WHY_US.map(({ icon: Icon, title, desc, highlight, emphasis, boldPrefix }, idx) => (
              <motion.div key={title} variants={fadeUp} custom={idx % 3} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`group relative flex flex-col overflow-hidden p-7 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl ${
                  highlight
                    ? 'rounded-[14px] border border-[#D4AF37]/35 bg-white/[0.08] shadow-[0_0_28px_rgba(212,175,55,0.12)]'
                    : 'rounded-[14px] border border-white/[0.06] bg-white/[0.04] shadow-lg hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
                }`}>
                {highlight && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/70 to-[#D4AF37]/0" />
                )}
                <span className="pointer-events-none absolute bottom-3 right-4 font-poppins text-[80px] font-black text-white/[0.04] leading-none select-none">{String(idx + 1).padStart(2, '0')}</span>
                <div className={`mb-5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-105 ${
                  highlight ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/[0.08] text-[#D4AF37]'
                }`}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-poppins text-[15px] font-bold text-white leading-snug">
                  {boldPrefix ? <><strong className="font-extrabold text-[#D4AF37]">{boldPrefix}</strong>{title.slice(boldPrefix.length)}</> : title}
                </h3>
                <div className="mt-2 mb-3 h-px w-7 bg-[#D4AF37]/40 transition-all duration-500 group-hover:w-12" />
                <p className="text-[13px] leading-[1.65] text-white/55 line-clamp-3">
                  {emphasis ? (() => {
                    const i = desc.indexOf(emphasis);
                    return i === -1 ? desc : <>{desc.slice(0, i)}<strong className="font-extrabold text-white/90">{emphasis}</strong>{desc.slice(i + emphasis.length)}</>;
                  })() : desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STUDENT BENEFITS ── */}
      <section id="benefits" className="bg-white py-16 md:py-20 lg:py-[80px]">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-stretch gap-10 md:gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            {/* Left: content */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col justify-center">
              <span className="mb-4 inline-block w-fit rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A1931]">Student Benefits</span>
              <h2 className="font-poppins text-[1.9rem] font-bold leading-[1.15] text-[#0A1931] sm:text-4xl lg:text-[2.6rem]">What You Gain From This Program</h2>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed lg:text-base" style={{ color: 'rgba(10,25,49,0.55)' }}>Everything you need to go from campus to corporate — skills, confidence, connections, and a confirmed job offer.</p>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {BENEFITS.map(({ icon: Icon, title, desc }) => {
                  const highlightDesc = desc
                    .replace('₹3L–₹8L', '<strong class="text-[#0A1931]">₹3L–₹8L</strong>')
                    .replace('6 weeks', '<strong class="text-[#0A1931]">6 weeks</strong>')
                    .replace('placement support', '<strong class="text-[#0A1931]">placement support</strong>');
                  return (
                    <div
                      key={title}
                      className="flex h-full gap-4 rounded-[12px] border border-[#e8edf3] bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#D4AF37]/25"
                    >
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#0A1931]/[0.06] text-[#0A1931]">
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div>
                        <p className="font-poppins text-[0.9rem] font-semibold leading-snug text-[#0A1931]">{title}</p>
                        <p
                          className="mt-1 text-[0.82rem] leading-relaxed"
                          style={{ color: 'rgba(10,25,49,0.55)' }}
                          dangerouslySetInnerHTML={{ __html: highlightDesc }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA + trust line */}
              <div className="mt-8 flex flex-col gap-2">
                <a
                  href="https://forms.gle/S27eFPLigM2gwumVA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#0A1931] hover:text-[#D4AF37] transition-colors duration-150"
                >
                  Start Your Finance Career
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
                <p className="text-[0.78rem]" style={{ color: 'rgba(10,25,49,0.40)' }}>Trusted by 500+ students placed across India</p>
              </div>
            </motion.div>

            {/* Right: image */}
            <motion.div variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-stretch">
              <div className="relative w-full overflow-hidden rounded-[18px] shadow-[0_8px_40px_rgba(10,25,49,0.14)]">
                <img
                  src="https://images.hostinger.com/ab6ec182-1ea8-478a-82b2-5d8dcd22afe7.png"
                  alt="Finance professional working at a modern office"
                  className="h-full min-h-[420px] w-full object-cover md:min-h-[520px] lg:min-h-[600px]"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── INDUSTRY-RECOGNIZED CERTIFICATE ── */}
      <section id="certificate" className="border-t border-[#eef1f5] bg-[#fbfbfd] py-16 md:py-20 lg:py-[80px]">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-10 md:gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            {/* Left: certificate image (first on mobile) */}
            <div className="order-1 lg:order-1">
              <button
                type="button"
                onClick={() => setCertOpen(true)}
                className="group w-full cursor-zoom-in rounded-2xl border border-border/80 bg-white p-3 shadow-[0_8px_40px_rgba(10,25,49,0.10)] transition-shadow hover:shadow-[0_12px_48px_rgba(10,25,49,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 sm:p-4"
                aria-label="View certificate full size"
              >
                <div className="overflow-hidden rounded-xl bg-[#f8f9fb]">
                  <img
                    src={CERTIFICATE_IMG}
                    alt="Centaur Careers Certificate of Completion for the Financial Operations Masterclass"
                    className="h-auto w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
                  Click to enlarge
                </p>
              </button>
            </div>

            {/* Right: copy + benefits + CTA */}
            <div className="order-2 flex flex-col lg:order-2">
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-[#0A1931]">
                <GraduationCap className="h-3.5 w-3.5 text-[#D4AF37]" strokeWidth={2.25} aria-hidden />
                Course Completion Certificate
              </span>

              <h2 className="font-poppins text-[1.9rem] font-bold leading-[1.15] text-[#0A1931] sm:text-4xl lg:text-[2.6rem]">
                Receive an Industry-Recognized Certificate
              </h2>

              <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-[rgba(10,25,49,0.65)] lg:text-base">
                Upon successful completion of the 6-week Finance Career Program, you will receive an official Centaur Careers Course Completion Certificate that validates your practical training in Banking, Financial Services, Investment Operations, KYC/AML, Retail Banking, Digital Payments and Finance Operations.
              </p>

              <ul className="mt-7 space-y-3.5">
                {CERTIFICATE_BENEFITS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                      <CheckCircle2 className="h-4 w-4 text-[#D4AF37]" strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="text-[0.95rem] font-medium leading-relaxed text-[#0A1931]">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <a
                  href={ENROLL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-7 py-3.5 text-sm font-bold text-[#0A1931] shadow-[0_8px_24px_rgba(212,175,55,0.35)] transition-colors hover:bg-[#c9a432] active:scale-[0.98]"
                >
                  Enroll &amp; Earn Your Certificate
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={certOpen} onOpenChange={setCertOpen}>
          <DialogContent className="max-h-[92vh] w-[min(96vw,920px)] max-w-[920px] overflow-auto border-none bg-transparent p-0 shadow-none sm:rounded-2xl">
            <DialogTitle className="sr-only">Certificate of Completion — full view</DialogTitle>
            <div className="rounded-2xl bg-white p-2 sm:p-3 shadow-2xl">
              <img
                src={CERTIFICATE_IMG}
                alt="Centaur Careers Certificate of Completion — enlarged view"
                className="h-auto max-h-[85vh] w-full object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* ── PLACEMENT GUARANTEE ── */}
      <section id="guarantee" className="py-20 lg:py-28 bg-[#0A1931]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <motion.div className="mb-16 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Our Commitment to You</span>
            <h2 className="font-poppins mt-4 text-3xl font-bold text-white sm:text-4xl md:text-[2.6rem]">Placement Guarantee &amp; Student Promise</h2>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-white/55">We don't just promise placement — we build a structured pathway to it. Every student who meets program criteria is supported until they secure the right role, or we return their fee in full.</p>
          </motion.div>

          {/* Core guarantee cards */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-14">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: '180-Day Placement Window',
                  highlight: '180 days',
                  desc: 'Complete the program, meet all criteria, and if you are not placed within 180 days we issue a 100% fee refund. No arguments, no excuses.'
                },
                {
                  icon: Users,
                  title: '8 Interview Opportunities',
                  highlight: '8 interview opportunities',
                  desc: 'You receive up to 8 direct interviews with our hiring partners. If all 8 are exhausted without success, we assess gaps and restart the process.'
                },
                {
                  icon: RefreshCw,
                  title: 'No Student Left Behind',
                  highlight: null,
                  desc: 'Bronze and Silver tier students receive extended training, 1:1 mentorship, and additional mock interviews before placement begins.'
                },
              ].map(({ icon: Icon, title, highlight, desc }) => (
                <div key={title}
                  className="flex flex-col gap-4 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.04)', boxShadow: '0 2px 20px rgba(0,0,0,0.25)' }}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20">
                    <Icon className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-poppins text-sm font-bold text-white mb-3 leading-snug">{title}</h3>
                    <p className="text-xs leading-[1.75] text-white/60">
                      {highlight ? desc.split(highlight).map((part, i, arr) => (
                        i < arr.length - 1
                          ? <React.Fragment key={i}>{part}<span className="font-bold text-[#D4AF37]">{highlight}</span></React.Fragment>
                          : <React.Fragment key={i}>{part}</React.Fragment>
                      )) : desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tier system */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
            <div className="flex justify-center mb-12 mt-4">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">Assessment-Based Placement Tiers</p>
            </div>

            {/* All 4 tiers — equal grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  tier: 'Platinum',
                  range: '85–100',
                  color: '#E5E4E2',
                  bg: 'rgba(229,228,226,0.05)',
                  border: 'rgba(229,228,226,0.25)',
                  shadow: '0 0 20px rgba(229,228,226,0.15), 0 4px 16px rgba(0,0,0,0.2)',
                  isPlatinum: true,
                  textOpacity: 'text-white/75',
                  perks: ['First-choice role selection', 'Global banks & top NBFC access', 'Salary band ₹7–12 LPA', 'Priority interview scheduling'],
                },
                {
                  tier: 'Gold',
                  range: '70–84',
                  color: '#D4AF37',
                  bg: 'rgba(212,175,55,0.04)',
                  border: 'rgba(212,175,55,0.15)',
                  shadow: '0 2px 12px rgba(0,0,0,0.18)',
                  isPlatinum: false,
                  textOpacity: 'text-white/70',
                  perks: ['Strong role access across sectors', 'Private banks & mid-tier NBFC placement', 'Salary band ₹4–6 LPA', 'Standard interview scheduling']
                },
                {
                  tier: 'Silver',
                  range: '50–69',
                  color: '#C0C0C0',
                  bg: 'rgba(192,192,192,0.03)',
                  border: 'rgba(192,192,192,0.10)',
                  shadow: '0 2px 10px rgba(0,0,0,0.15)',
                  isPlatinum: false,
                  textOpacity: 'text-white/50',
                  perks: ['Extended training & re-assessment', 'NBFCs, FinTech & regional banks', 'Salary band ₹3–5 LPA', 'Additional mock interviews'],
                },
                {
                  tier: 'Bronze',
                  range: 'Below 50',
                  color: '#CD7F32',
                  bg: 'rgba(205,127,50,0.03)',
                  border: 'rgba(205,127,50,0.10)',
                  shadow: '0 2px 10px rgba(0,0,0,0.15)',
                  isPlatinum: false,
                  textOpacity: 'text-white/50',
                  perks: ['1:1 gap assessment & mentoring', 'Targeted skill remediation', 'Entry-level BFSI roles', 'Placement after re-assessment'],
                },
              ].map(({ tier, range, color, bg, border, shadow, isPlatinum, textOpacity, perks }) => (
                <div key={tier}
                  className={`rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 ${isPlatinum ? 'ring-1 ring-offset-0' : ''}`}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    boxShadow: shadow,
                    ...(isPlatinum && { ringColor: 'rgba(229,228,226,0.3)' })
                  }}>
                  {/* Header: Tier name + Score range */}
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="font-poppins text-lg font-bold" style={{ color }}>{tier}</span>
                    <span className="text-[9px] font-semibold" style={{ color, opacity: 0.45 }}>{range}</span>
                  </div>
                  
                  {/* Perks list */}
                  <ul className="space-y-4 flex-1">
                    {perks.map((perk) => (
                      <li key={perk} className={`flex items-start gap-2.5 text-[12px] leading-[1.6] ${textOpacity}`}>
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color, opacity: 0.5 }} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-[10px] text-white/25 max-w-md mx-auto leading-relaxed">Score = aggregate of weekly assessments, mock interviews, and practical project evaluations across the 6-week program.</p>
          </motion.div>

          {/* Eligibility + CTA */}
          <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-2" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="rounded-2xl border border-white/8 p-8" style={{ background: 'rgba(255,255,255,0.04)', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
              <h3 className="font-poppins text-sm font-bold text-white mb-5 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#D4AF37]" /> Guarantee Eligibility Criteria
              </h3>
              <ul className="space-y-4">
                {[
                  'Complete all 6 weeks with 80%+ attendance',
                  'Achieve a minimum Bronze-tier score',
                  'Submit all assessments and practical projects',
                  'Participate in all scheduled mock interviews',
                  'Accept reasonable offers within target CTC range',
                  'Maintain professional conduct throughout',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-xs leading-[1.7] text-white/65">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D4AF37]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[10px] text-white/30 leading-relaxed">Full terms available on request. T&C apply. Placement guarantee is contingent on meeting eligibility criteria above.</p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-[#D4AF37]/35 p-9 text-center"
              style={{ background: 'rgba(212,175,55,0.10)', boxShadow: '0 0 24px rgba(212,175,55,0.12), 0 4px 20px rgba(0,0,0,0.25)' }}>
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-[#0A1931]">
                <BadgeCheck className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-2xl font-bold text-white mb-4 leading-snug">Your Success Is<br />Our Accountability</h3>
              <p className="text-xs leading-[1.8] text-white/60 mb-8 max-w-xs mx-auto">Our placement team works alongside you from training to offer letter. Your career transformation is what measures our success.</p>
              <div className="flex flex-col gap-3 items-center">
                <a href={ENROLL} target="_blank" rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#D4AF37] px-8 py-4 font-poppins text-sm font-bold text-[#0A1931] shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-[#c9a227] hover:shadow-[0_8px_24px_rgba(212,175,55,0.35)]">
                  Enroll &amp; Get Guaranteed <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/8 px-8 py-3.5 font-poppins text-sm font-bold text-white transition-all duration-200 hover:bg-white/15">
                  <MessageCircle className="mr-2 h-4 w-4 text-green-400" /> Ask About Guarantee
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 lg:py-28 bg-muted/40 border-y border-border">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-14 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A1931]">Pricing</span>
            <h2 className="font-poppins text-3xl font-bold text-[#0A1931] sm:text-4xl">Choose Your Learning Mode</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">Same curriculum and placement guarantee. Different experience levels.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[{
              mode: 'Online', price: '₹35,000', originalPrice: '₹50,000',
              priceNote: 'Limited-time cohort pricing',
              desc: 'Flexible, learn from anywhere',
              features: ['6-week live online sessions', 'Recorded session access', 'Online mock interviews', 'Resume & LinkedIn support', 'Email & chat mentorship', 'Full placement assistance', '100% fee refund guarantee (T&C)'],
              cta: 'Enroll Online'
            }, {
              mode: 'Offline', price: '₹50,000', originalPrice: '₹70,000',
              priceNote: 'Includes in-person mentorship & infrastructure',
              desc: 'In-person, immersive experience',
              features: ['All Online features included', 'In-person sessions at Mindsprout', 'Dedicated study workspace', 'Face-to-face mentorship', 'In-person mock interviews', 'Peer networking & study groups', 'Refreshments & learning materials'],
              cta: 'Enroll Offline'
            }].map(({ mode, price, originalPrice, priceNote, desc, features, cta }, idx) => (
              <motion.div key={mode} variants={fadeUp} custom={idx} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
                <div className="flex flex-1 flex-col p-8">
                  <div className="flex items-center justify-between">
                    <p className="font-poppins text-sm font-bold uppercase tracking-wider text-muted-foreground">{mode} Mode</p>
                    <span className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0A1931]">Early Cohort Pricing</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <p className="font-poppins text-4xl font-bold text-[#0A1931]">{price}</p>
                    <p className="font-poppins text-lg text-muted-foreground/70 line-through">{originalPrice}</p>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{priceNote}</p>
                  <p className="mt-3 text-sm text-muted-foreground italic">{desc}</p>
                  <div className="my-7 h-px bg-border" />
                  <ul className="flex-1 space-y-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D4AF37]" />
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={ENROLL} target="_blank" rel="noopener noreferrer"
                    className="mt-8 inline-flex h-13 items-center justify-center rounded-xl bg-[#0A1931] font-poppins text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#112240]"
                    style={{ height: '52px' }}>
                    {cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <div className="max-w-[650px] text-center">
              <p className="text-sm font-medium text-foreground/85 leading-relaxed">
                Delivered at Mindsprout Careers Hub, Lucknow — a dedicated in-person learning environment powered by Centaur Careers.
              </p>
              <p className="mt-3 text-xs text-muted-foreground/65 leading-relaxed">
                Placement guarantee subject to terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 lg:py-28 bg-[#0A1931]">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-14 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Success Stories</span>
            <h2 className="font-poppins text-3xl font-bold text-white sm:text-4xl md:text-5xl">Placement Outcomes That Speak for Themselves</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/70">Our learners are building careers across institutions like Citi, HSBC, and JP Morgan.</p>
          </motion.div>

          {/* Trust Strip */}
          <motion.div className="mb-12 flex flex-col items-center gap-3" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-8 py-3.5 backdrop-blur-sm">
              <span className="text-base font-bold text-[#D4AF37]">500+ trained</span>
              <span className="text-[#D4AF37]/50 text-lg font-light">•</span>
              <span className="text-base font-bold text-white/85">100+ placed in top finance roles</span>
            </div>
            <p className="text-xs font-medium text-white/55 tracking-wide">Roles include KYC Analyst, IB Operations, Relationship Manager &amp; more</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Rohit K.', role: 'Fund Accounting Specialist', company: 'Citi', quote: 'Centaur gave me structured guidance and hands-on practice. I landed at Citi within weeks. The mock interviews were more rigorous than the actual one.' },
              { name: 'Nikita B.', role: 'Relationship Manager', company: 'City Union Bank', quote: 'The program was practical and focused on real job readiness. My mentor walked me through every stage — skills, assessments, and interviews. It worked.' },
              { name: 'Rahul S.', role: 'IB Operations', company: 'JP Morgan', quote: 'They pushed us harder in training than the actual interview. By the time I sat down at JP Morgan, I already knew what to expect.' },
              { name: 'Sneha M.', role: 'Operations Analyst', company: 'Citi', quote: 'I appreciated how structured the process was. Every assessment had a purpose, and the placement team followed through at every step.' },
              { name: 'Karan V.', role: 'Compliance Analyst', company: 'HSBC', quote: 'The KYC and AML modules were exactly what HSBC was looking for. I felt prepared — not just trained.' },
              { name: 'Priya A.', role: 'Retail Banking Officer', company: 'Kotak Mahindra Bank', quote: 'I had no banking background when I joined. Centaur broke everything down — from theory to job-ready skills. Placed within weeks of finishing.' },
            ].map(({ name, role, company, quote }, idx) => (
              <motion.div key={name + idx} variants={fadeUp} custom={idx % 3} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/40 hover:bg-white/[0.08] hover:shadow-[0_12px_40px_rgba(212,175,55,0.12)]">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />)}
                </div>
                <div className="flex-1 relative pt-3">
                  <span className="pointer-events-none absolute -top-2 -left-1 font-serif text-5xl font-black text-[#D4AF37]/25 leading-none select-none">&#8220;</span>
                  <p className="text-sm leading-relaxed text-white/75">{quote}</p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/20 font-bold text-[#D4AF37]">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{name}</p>
                    <p className="text-xs text-white/60">{role} · <span className="font-bold text-[#D4AF37]">{company}</span></p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-14 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A1931]">Our Leadership</span>
            <h2 className="font-poppins text-3xl font-bold text-[#0A1931] sm:text-4xl">Leadership Driving Your Career Outcomes</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">Led by professionals with experience across banking, training, and placements — focused on delivering real career outcomes.</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: UserCheck, name: 'Bharat Singh', role: 'Founder & Director', org: 'Centaur Careers', credibility: '7+ years of experience in Investment banking and edtech', email: 'contact@centaurcareers.in' },
              { icon: BookOpen, name: 'Amit Balani', role: 'Training Partner', org: 'Mindsprout Careers Hub', credibility: '25+ years in education, mentoring & skill development', email: 'mindsprout121@gmail.com' },
              { icon: Briefcase, name: 'Virat Singh', role: 'Head of Business', org: 'Centaur Careers', credibility: '5+ years in investment banking & institutional partnerships', email: 'virat.singh@centaurcareers.in' },
              { icon: Target, name: 'Naman Chaturvedi', role: 'Business Outreach & Growth Partner', org: 'Centaur Careers', credibility: '2+ years of experience in Investment Banking', email: 'naman.chaturvedi@centaurcareers.in' },
            ].map(({ icon: Icon, name, role, org, credibility, email }, idx) => (
              <motion.div key={name} variants={fadeUp} custom={idx % 4} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/50 hover:shadow-2xl">
                <div className="h-1.5 bg-gradient-to-r from-[#0A1931] to-[#D4AF37]" />
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-5 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#D4AF37]/30 shadow-inner ring-4 ring-[#D4AF37]/10 transition group-hover:ring-[#D4AF37]/30" style={{ background: 'hsl(220 48% 20% / 0.06)' }}>
                      <Icon className="h-9 w-9 text-[#0A1931]" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="mb-3 text-center">
                    <h3 className="font-poppins text-lg font-bold text-[#0A1931]">{name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#D4AF37]">{role}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{org}</p>
                  </div>
                  <p className="mb-5 text-center text-xs leading-relaxed text-muted-foreground">{credibility}</p>
                  <div className="mt-auto border-t border-border/60 pt-4">
                    <a href={`mailto:${email}`} className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-[#D4AF37] break-all">
                      <Mail className="h-3 w-3 flex-shrink-0" /> {email}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 lg:py-28 bg-muted/40 border-y border-border">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-14 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A1931]">FAQ</span>
            <h2 className="font-poppins text-3xl font-bold text-[#0A1931] sm:text-4xl">Frequently Asked Questions</h2>
          </motion.div>
          <FAQAccordion faqs={FAQS} />
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-14 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-4 inline-block rounded-full bg-[#D4AF37]/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0A1931]">Get In Touch</span>
            <h2 className="font-poppins text-3xl font-bold text-[#0A1931] sm:text-4xl">Start Your Finance Career Journey Today</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">Have questions? Reach us directly on WhatsApp, call, or email for the fastest response.</p>
          </motion.div>

          <div className="flex justify-center">
            {/* Centered Contact Info */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full max-w-2xl space-y-6">
              <div className="rounded-2xl border border-border bg-[#0A1931] p-8 text-white">
                <h3 className="font-poppins text-xl font-bold mb-5">Quick Contact</h3>
                <div className="space-y-4">
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-xl bg-white/10 p-4 transition hover:bg-white/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white flex-shrink-0">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">WhatsApp (Fastest)</p>
                      <p className="text-sm text-white/65">Chat with our team instantly</p>
                    </div>
                    <ArrowRight className="ml-auto h-5 w-5 text-white/40" />
                  </a>
                  <a href="tel:+919369213948"
                    className="flex items-center gap-4 rounded-xl bg-white/10 p-4 transition hover:bg-white/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37] text-[#0A1931] flex-shrink-0">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">Call Us</p>
                      <p className="text-sm text-white/65">+91 9369213948</p>
                    </div>
                  </a>
                  <a href="mailto:contact@centaurcareers.in"
                    className="flex items-center gap-4 rounded-xl bg-white/10 p-4 transition hover:bg-white/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white flex-shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">Email Us</p>
                      <p className="text-sm text-white/65">contact@centaurcareers.in</p>
                    </div>
                  </a>
                </div>
                <div className="mt-6 flex gap-4">
                  <a href="https://www.linkedin.com/company/centaur-careers/" target="_blank" rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#D4AF37] hover:text-[#0A1931]">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="https://www.instagram.com/centaurcareers" target="_blank" rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#D4AF37] hover:text-[#0A1931]">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-green-500">
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <a href={ENROLL} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/10 p-6 transition hover:bg-[#D4AF37]/20">
                <div>
                  <p className="font-poppins text-lg font-bold text-[#0A1931]">Ready to Enroll?</p>
                  <p className="text-sm text-muted-foreground">Fill out the enrollment form and our team will reach out within 24 hours.</p>
                </div>
                <ArrowRight className="ml-auto h-6 w-6 text-[#D4AF37] flex-shrink-0" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden bg-[#0A1931] py-20 lg:py-28 border-t-4 border-[#D4AF37]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="mb-6 inline-block rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Limited Seats — Next Batch</span>
            <h2 className="font-poppins text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Ready to Transform Your Finance Career?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
              Join hundreds of BBA, BCom, and MBA graduates who chose Centaur Careers and secured corporate finance roles across India. Enroll today and get your career started in 6 weeks.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href={ENROLL} target="_blank" rel="noopener noreferrer"
                className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#D4AF37] px-10 font-poppins text-base font-bold text-[#0A1931] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#c9a227] sm:w-auto">
                Enroll Now — Secure Your Seat <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                className="inline-flex h-14 w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-10 font-poppins text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto">
                <MessageCircle className="mr-2 h-5 w-5 text-green-400" /> Chat on WhatsApp
              </a>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-white/45">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#D4AF37]" /> 100% Placement Guarantee</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#D4AF37]" /> 6-Week Program</span>
              <span className="flex items-center gap-2"><Target className="h-4 w-4 text-[#D4AF37]" /> ₹3–12 LPA Target</span>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
