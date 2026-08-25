export const GENERAL_FAQS = Object.freeze([
  Object.freeze({
    question: 'Who is eligible for the program?',
    answer: "This program is open to graduates from any field, including BBA, BCom, BA, BSc, BTech, and MBA (final-year students can also apply). You don't need a finance background — we start from fundamentals and train you to become job-ready for finance roles.",
  }),
  Object.freeze({
    question: 'What is the placement guarantee exactly?',
    answer: 'If you meet Platinum/Gold criteria (85%+ attendance, all assessments, all mock interviews, attend drives) but are not placed within 180 days of completion, we refund 100% of your fee as per the Guarantee Terms.',
  }),
  Object.freeze({
    question: 'What is the difference between Online and Offline modes?',
    answer: `Both Online and Offline programs are LIVE, instructor-led training with the same curriculum, mentorship, and placement support.

The Online program (₹35,000) is designed for flexibility — you can attend live classes from anywhere without compromising on learning or outcomes.

The Offline program (₹50,000) offers the same live training in an in-person environment at Mindsprout Careers Hub, Lucknow, with added benefits like face-to-face interaction, structured routine, and peer networking.

No matter which mode you choose, the training quality, support, and career outcomes remain the same — only the learning experience differs.`,
  }),
  Object.freeze({
    question: 'How many interview opportunities do I get?',
    answer: 'Up to 8 distinct interview opportunities. If all 8 are exhausted without placement, a remock assessment is conducted to identify gaps and resume the process.',
  }),
  Object.freeze({
    question: 'Can I choose which city I want to work in?',
    answer: 'Yes. We support placements across Mumbai, Bengaluru, Pune, Delhi/NCR, and Hyderabad. Lucknow students can also access hometown Retail Banking and NBFC roles.',
  }),
  Object.freeze({
    question: 'What happens after I get placed?',
    answer: 'Your placement journey does not end at offer acceptance. We provide onboarding guidance, post-placement check-ins, and access to our alumni network for continued career growth.',
  }),
]);

// The original site supplied one program-level FAQ set, not separate factual
// FAQs for each career-track page. Reuse that approved set rather than inventing
// track-specific answers.
export const COURSE_FAQS = Object.freeze({
  'investment-banking-operations': GENERAL_FAQS,
  'retail-banking': GENERAL_FAQS,
  'finance-operations': GENERAL_FAQS,
});
