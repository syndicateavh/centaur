import { BUSINESS_DATA } from './businessData.js';

const contactDetails = `You can contact ${BUSINESS_DATA.name} at ${BUSINESS_DATA.email} or ${BUSINESS_DATA.displayTelephone}. The published in-person learning location is ${BUSINESS_DATA.trainingLocation.name}, ${BUSINESS_DATA.trainingLocation.address.streetAddress}, ${BUSINESS_DATA.trainingLocation.address.addressLocality}, ${BUSINESS_DATA.trainingLocation.address.addressRegion} ${BUSINESS_DATA.trainingLocation.address.postalCode}, India. This is a partner training location and should not be treated as the registered office address of ${BUSINESS_DATA.legalName}.`;

export const LEGAL_PAGES = Object.freeze({
  'privacy-policy': Object.freeze({
    eyebrow: 'Privacy and data',
    title: 'Privacy Policy',
    intro: 'How Centaur Careers collects, uses, protects, and shares information when you visit this website or contact us about a program.',
    updatedAt: '26 September 2026',
    sections: Object.freeze([
      Object.freeze({
        title: '1. Who this policy applies to',
        paragraphs: Object.freeze([
          `This Privacy Policy applies to the Centaur Careers website at ${BUSINESS_DATA.url} and to enquiries about our Financial Operations Masterclass and related services. The website is operated by ${BUSINESS_DATA.legalName}.`,
          'Please read this policy together with our Terms and Conditions, Cookie Policy, Refund and Cancellation Policy, and Disclaimer.',
        ]),
      }),
      Object.freeze({
        title: '2. Information we may collect',
        paragraphs: Object.freeze([
          'We may receive information that you choose to provide when you contact us, request program details, submit an enquiry or application, communicate through WhatsApp, email or phone, or ask about a cohort. This may include your name, contact details, education or work background, city, program interests, and information included in your message or profile.',
          'We may also receive technical and campaign information such as your IP address, browser and device details, pages viewed, referring page, approximate location, UTM campaign values, and Google click identifiers. We use this information to understand website visits and measure advertising or marketing activity.',
        ]),
      }),
      Object.freeze({
        title: '3. How we use information',
        bullets: Object.freeze([
          'Respond to enquiries, share requested program information, and coordinate calls or messages.',
          'Process applications and provide the services, support, and communications you request.',
          'Maintain, secure, troubleshoot, and improve the website and our communications.',
          'Measure website, campaign, and advertising performance and understand which pages help visitors.',
          'Meet legal, regulatory, fraud-prevention, recordkeeping, and dispute-resolution obligations.',
        ]),
      }),
      Object.freeze({
        title: '4. Service providers and sharing',
        paragraphs: Object.freeze([
          'We may share information with service providers who help us host the website, measure visits, manage advertising tags, process enquiries, or provide communication channels. These may include Google services such as Google Analytics, Google Tag Manager and Google Forms, Microsoft Clarity, hosting providers, and WhatsApp or other communication providers. They may process information under their own terms and privacy policies.',
          'We may disclose information where required by law, to protect rights and safety, to investigate misuse, or as part of a business reorganisation. We do not sell your personal information for money.',
        ]),
      }),
      Object.freeze({
        title: '5. Advertising, analytics, and your choices',
        paragraphs: Object.freeze([
          'This website currently loads Google Analytics, Google Tag Manager and Microsoft Clarity. We may use those tools, Google Ads, or other measurement partners to understand visits, record campaign attribution, prevent abuse, and improve advertising. These services may use cookies, local storage, pixels, or similar technologies. See the Cookie Policy for more information.',
          'You can limit cookies and similar technologies through your browser settings and can opt out of marketing communications by contacting us. Blocking some technologies may affect website features or measurement accuracy. Third-party services may provide additional controls through their own settings and policies.',
        ]),
      }),
      Object.freeze({
        title: '6. Retention and security',
        paragraphs: Object.freeze([
          'We keep information only for as long as reasonably necessary for the purposes described here, including responding to an enquiry, maintaining business records, resolving disputes, and meeting legal obligations. Retention periods can vary by the type of information and the service involved.',
          'We use reasonable administrative and technical safeguards, but no internet transmission or storage system can be guaranteed completely secure. Do not send passwords, payment-card details, account credentials, or sensitive identity documents through an ordinary website enquiry.',
        ]),
      }),
      Object.freeze({
        title: '7. Your requests',
        paragraphs: Object.freeze([
          'Subject to applicable law and reasonable verification, you may ask us to access, correct, update, delete, or stop using personal information that we hold about you. You may also withdraw a consent or ask us to stop sending marketing communications. Contact us using the details below and describe your request clearly.',
          contactDetails,
        ]),
      }),
      Object.freeze({
        title: '8. External websites and changes',
        paragraphs: Object.freeze([
          'Our pages may link to external websites, forms, social networks, maps, or messaging services. Their privacy practices are controlled by those providers, not by this policy. Review their policies before submitting information.',
          'We may update this policy when our services, technology, or legal obligations change. The revised version will be published on this page with a new update date.',
        ]),
      }),
    ]),
    relatedLinks: Object.freeze([
      Object.freeze({ label: 'Read our Cookie Policy', to: '/cookie-policy/' }),
      Object.freeze({ label: 'Contact Centaur Careers', to: '/contact/' }),
    ]),
  }),

  'terms-and-conditions': Object.freeze({
    eyebrow: 'Website terms',
    title: 'Terms and Conditions',
    intro: 'The terms that apply when you use the Centaur Careers website, content, enquiry channels, and program information.',
    updatedAt: '23 September 2026',
    sections: Object.freeze([
      Object.freeze({
        title: '1. About these terms',
        paragraphs: Object.freeze([
          `These Terms and Conditions govern your use of ${BUSINESS_DATA.url}, which is operated by ${BUSINESS_DATA.legalName}. By using the website or submitting an enquiry, you agree to follow these terms and all applicable laws. If you do not agree, please do not use the website.`,
          'Program-specific written terms, enrolment communications, invoices, and the published Job Guarantee Terms may contain additional conditions. Where they apply to a paid service, those specific terms will control that service.',
        ]),
      }),
      Object.freeze({
        title: '2. Website content',
        paragraphs: Object.freeze([
          'The website provides general information about finance-career learning, the Financial Operations Masterclass, current learning modes, and ways to contact the team. We try to keep information useful and current, but cohort dates, availability, fees, curriculum, support, and other details may change. Confirm the current terms with us before making a payment or relying on a time-sensitive detail.',
          'Educational articles, quizzes, examples, and career guides are for learning and preparation. They are not legal, tax, investment, lending, employment, or regulatory advice.',
        ]),
      }),
      Object.freeze({
        title: '3. Applications and communications',
        paragraphs: Object.freeze([
          'You are responsible for providing accurate information in an enquiry or application and for keeping your contact details current. We may contact you about the request you made, the program, scheduling, payment instructions, support, or related services.',
          'Submitting an enquiry does not by itself create an enrolment, employment relationship, job offer, or entitlement to a seat. Enrolment is subject to the current cohort terms and confirmation from Centaur Careers.',
        ]),
      }),
      Object.freeze({
        title: '4. Program terms, fees, and cancellation',
        paragraphs: Object.freeze([
          'Before you pay, review the current cohort information, applicable fees, learning mode, inclusions, graduation entry requirement, and published Job Guarantee Program summary. Request the current written terms for your cohort. Payment instructions should be confirmed through an official Centaur Careers communication. Our Refund and Cancellation Policy explains how to raise a request; it does not replace any specific written terms provided for your cohort.',
          'Do not make a payment solely because of an old screenshot, forwarded message, search result, or third-party statement. Contact us if any published information appears inconsistent.',
        ]),
      }),
      Object.freeze({
        title: '5. Acceptable use',
        bullets: Object.freeze([
          'Use the website lawfully and do not interfere with its availability, security, or operation.',
          'Do not scrape, copy, republish, sell, reverse engineer, impersonate, or misuse website content or brand assets without written permission.',
          'Do not submit malicious code, unlawful material, another person’s personal information, or misleading application details.',
        ]),
      }),
      Object.freeze({
        title: '6. Intellectual property',
        paragraphs: Object.freeze([
          'Unless stated otherwise, website text, page design, original learning material, branding, graphics, and logos belong to Centaur Careers or its licensors. We grant you a limited, personal, non-transferable right to view the website for lawful informational use. No other licence is granted by these terms.',
        ]),
      }),
      Object.freeze({
        title: '7. Third-party services and liability',
        paragraphs: Object.freeze([
          'The website may link to or use third-party services including forms, messaging, maps, analytics, advertising, social networks, and payment or communication tools. Those services have their own terms and may be unavailable or change without notice.',
          'To the extent permitted by law, Centaur Careers is not responsible for indirect loss, third-party service failures, or decisions made solely from general website information. Nothing in these terms excludes a liability that cannot lawfully be excluded.',
        ]),
      }),
      Object.freeze({
        title: '8. Governing law and contact',
        paragraphs: Object.freeze([
          'These terms are intended to be governed by the laws of India. Subject to mandatory consumer or other applicable law, disputes will be handled by the courts having jurisdiction in Lucknow, Uttar Pradesh.',
          contactDetails,
        ]),
      }),
      Object.freeze({
        title: '9. Updates',
        paragraphs: Object.freeze([
          'We may update these terms when the website or our services change. Continued use after an updated version is published means you accept the revised terms for future use of the website.',
        ]),
      }),
    ]),
    relatedLinks: Object.freeze([
      Object.freeze({ label: 'Review the Refund and Cancellation Policy', to: '/refund-cancellation-policy/' }),
      Object.freeze({ label: 'View the Job Guarantee Program summary', to: '/placements/#job-guarantee-terms' }),
      Object.freeze({ label: 'Contact Centaur Careers', to: '/contact/' }),
    ]),
  }),

  'cookie-policy': Object.freeze({
    eyebrow: 'Cookies and technology',
    title: 'Cookie Policy',
    intro: 'How this website uses cookies, browser storage, and similar technologies for essential operation, analytics, and advertising measurement.',
    updatedAt: '26 September 2026',
    sections: Object.freeze([
      Object.freeze({
        title: '1. What cookies are',
        paragraphs: Object.freeze([
          'Cookies are small files stored by a website or a third-party service on your browser. Similar technologies can include pixels, scripts, session storage, and local storage. They can remember a setting, support a feature, measure a visit, or connect a campaign click with a later action.',
        ]),
      }),
      Object.freeze({
        title: '2. Technologies used on this website',
        bullets: Object.freeze([
          'Essential browser storage may support page behaviour, navigation, security, or temporary preferences.',
          'The site records limited campaign attribution values such as UTM parameters and Google click identifiers in session storage so marketing performance can be understood across a visit.',
          'Google Analytics measures page views and contact-link clicks. Its services may set or read cookies or similar identifiers to provide reports about website use.',
          'Google Tag Manager loads measurement and advertising tags configured for the site. Google services may set or read cookies or similar identifiers depending on the tags enabled in the container.',
          'Microsoft Clarity may collect interaction and diagnostic information to help us understand usability and improve the site.',
        ]),
      }),
      Object.freeze({
        title: '3. Why we use them',
        paragraphs: Object.freeze([
          'We use these technologies to keep the website working, understand how visitors use it, measure campaigns, identify useful pages, improve usability, and help evaluate enquiries or other actions that follow an advertisement. We do not use this page to promise that every third-party tag is active at all times; configurations may change.',
        ]),
      }),
      Object.freeze({
        title: '4. Managing cookies',
        paragraphs: Object.freeze([
          'You can delete existing cookies and block new cookies through your browser settings. Some browsers provide separate controls for third-party cookies, tracking protection, or “Do Not Track”. Blocking storage may reduce measurement accuracy or affect some website features.',
          'Google, Microsoft, and other third parties may provide their own privacy, advertising, and opt-out controls. Review the provider’s current documentation because those controls are operated by the provider and may change.',
        ]),
      }),
      Object.freeze({
        title: '5. More information',
        paragraphs: Object.freeze([
          'For information about personal information, requests, retention, and sharing, read our Privacy Policy. For questions about this policy or the technologies used on the website, contact us.',
          contactDetails,
        ]),
      }),
    ]),
    relatedLinks: Object.freeze([
      Object.freeze({ label: 'Read our Privacy Policy', to: '/privacy-policy/' }),
      Object.freeze({ label: 'Contact Centaur Careers', to: '/contact/' }),
    ]),
  }),

  'refund-cancellation-policy': Object.freeze({
    eyebrow: 'Payments and enrolment',
    title: 'Refund and Cancellation Policy',
    intro: 'How to request a cancellation or refund for a Centaur Careers program or related paid service.',
    updatedAt: '23 September 2026',
    sections: Object.freeze([
      Object.freeze({
        title: '1. Confirm the current cohort terms before paying',
        paragraphs: Object.freeze([
          'Fees, cohort dates, learning mode, inclusions, eligibility requirements, cancellation windows, and refund conditions can differ by cohort or service. Before making a payment, ask Centaur Careers for the current written terms and keep the payment receipt and confirmation message.',
          'If an invoice, enrolment communication, or signed agreement gives you a more specific refund or cancellation right, that specific written term will apply to the relevant payment. This page explains the request process and general approach; it is not a replacement for a cohort-specific agreement.',
        ]),
      }),
      Object.freeze({
        title: '2. How to request a cancellation or refund',
        bullets: Object.freeze([
          `Send your request to ${BUSINESS_DATA.email} from the email address used for the enquiry or payment, or contact us by phone at ${BUSINESS_DATA.displayTelephone}.`,
          'Include your full name, phone number, program or cohort, payment date, amount, receipt or transaction reference, and the reason for the request.',
          'Submit the request as soon as possible and before attending a session or using the relevant service where your current written terms make that timing relevant.',
          'Do not send complete card numbers, passwords, PINs, or other payment credentials in a message.',
        ]),
      }),
      Object.freeze({
        title: '3. Review and outcome',
        paragraphs: Object.freeze([
          'We will review the request against the applicable cohort terms, payment record, service status, and applicable law. We may ask for reasonable information to verify the transaction and the requester. If a refund is approved, we will normally use the original payment method or another lawful method agreed with you, subject to the payment provider’s processing time.',
          'A request may be declined where the applicable written terms do not provide a refund, the service has already been materially used, the request cannot be verified, or a legal exception applies. We will explain the outcome and any available next step.',
        ]),
      }),
      Object.freeze({
        title: '4. Job guarantee and refund requests are separate',
        paragraphs: Object.freeze([
          'The 100% Job Guarantee Program promises a finance job to graduates and job switchers after completing the six-week program. A job-guarantee request is not automatically a fee-refund request. Review the published summary and ask the team for the current written cohort conditions before enrolling.',
        ]),
      }),
      Object.freeze({
        title: '5. Contact',
        paragraphs: Object.freeze([
          contactDetails,
          'We may update this policy when our program, payment providers, or legal obligations change. The update date at the top of this page shows the current published version.',
        ]),
      }),
    ]),
    relatedLinks: Object.freeze([
      Object.freeze({ label: 'View the Job Guarantee Program summary', to: '/placements/#job-guarantee-terms' }),
      Object.freeze({ label: 'Read our Terms and Conditions', to: '/terms-and-conditions/' }),
      Object.freeze({ label: 'Contact Centaur Careers', to: '/contact/' }),
    ]),
  }),

  disclaimer: Object.freeze({
    eyebrow: 'Important information',
    title: 'Disclaimer',
    intro: 'Important limits on the career, education, finance, and program information published by Centaur Careers.',
    updatedAt: '23 September 2026',
    sections: Object.freeze([
      Object.freeze({
        title: '1. Educational information only',
        paragraphs: Object.freeze([
          'The website, blog, resources, quizzes, examples, and career guides are provided for general education and preparation. They do not constitute legal, tax, investment, lending, employment, medical, or regulatory advice, and they are not a substitute for advice from a qualified professional or an employer’s approved procedure.',
          'Finance, banking, compliance, payments, and employment practices can vary by institution, role, jurisdiction, and date. Verify current requirements with the relevant employer, regulator, institution, or professional adviser before acting.',
        ]),
      }),
      Object.freeze({
        title: '2. Program information and job guarantee',
        paragraphs: Object.freeze([
          'Centaur Careers describes a six-week Financial Operations Masterclass and a 100% Job Guarantee Program for graduates and job switchers who complete the program. Graduation is the program entry requirement. The placement page provides a public summary; request the current written terms for your cohort before applying or paying.',
          'The published guarantee is for a finance job after program completion. The website does not specify a particular employer, job title, salary, location, or joining date unless that detail is expressly stated in current written terms that apply to you. Current fees, cohort dates, availability, curriculum, and support may change.',
        ]),
      }),
      Object.freeze({
        title: '3. Accuracy, availability, and third parties',
        paragraphs: Object.freeze([
          'We aim to publish useful and accurate information, but we do not guarantee that every page is complete, current, uninterrupted, or error-free. We may correct, update, suspend, or remove content without notice.',
          'Links to employers, platforms, forms, maps, social networks, analytics tools, or other third-party services are provided for convenience. Centaur Careers does not control their content, availability, privacy practices, or terms and does not imply endorsement merely by linking to them.',
        ]),
      }),
      Object.freeze({
        title: '4. Contact us before relying on a detail',
        paragraphs: Object.freeze([
          'If a page, advertisement, message, or older document gives different information, contact us and request the current written terms before applying, sharing personal information, or making a payment.',
          contactDetails,
        ]),
      }),
    ]),
    relatedLinks: Object.freeze([
      Object.freeze({ label: 'Read the Job Guarantee Program summary', to: '/placements/#job-guarantee-terms' }),
      Object.freeze({ label: 'Read our Privacy Policy', to: '/privacy-policy/' }),
      Object.freeze({ label: 'Contact Centaur Careers', to: '/contact/' }),
    ]),
  }),
});
