export const GENERAL_FAQS = Object.freeze([
  Object.freeze({
    question: 'Who can join the program?',
    answer: 'The program is open to graduates and job switchers from any academic background across India. Previous finance education or work experience is not required.',
  }),
  Object.freeze({
    question: 'Is this a 100% Job Guarantee Program?',
    answer: 'Yes. Centaur Careers guarantees a finance job to graduates and job switchers who complete the six-week Financial Operations Masterclass.',
  }),
  Object.freeze({
    question: 'What is the difference between Online and Offline modes?',
    answer: 'The public program information describes a live online option for learners across India and an in-person option at Mindsprout Career Hub in Lucknow. Ask the team to confirm the current cohort schedule, fees, facilities, included activities, and whether the curriculum or support differs by mode.',
  }),
  Object.freeze({
    question: 'How does the job guarantee work?',
    answer: 'After completing the six-week Financial Operations Masterclass, graduates and job switchers get a finance job through the 100% Job Guarantee Program. Interview preparation and role guidance support that process.',
  }),
  Object.freeze({
    question: 'Does the guarantee cover every job, employer, salary, and city?',
    answer: 'The program guarantees a finance job after completion. The complete scope is published in the Job Guarantee Terms on the Placements page.',
  }),
  Object.freeze({
    question: 'How can I confirm current course details before enrolling?',
    answer: 'Contact Centaur Careers to request the current cohort schedule, fees, learning-mode details, and certificate wording before enrolling.',
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
