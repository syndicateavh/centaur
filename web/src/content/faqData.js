export const GENERAL_FAQS = Object.freeze([
  Object.freeze({
    question: 'Who can join the program?',
    answer: 'Graduation is the entry requirement. The program is open to graduates and job switchers from any academic background across India; previous finance education or experience is not required. Confirm the current cohort requirements with Centaur Careers.',
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
    answer: 'Centaur Careers publishes a finance job guarantee for graduates and job switchers who complete the six-week Financial Operations Masterclass. The Placements page summarizes the promise; request the complete written terms for your cohort before paying.',
  }),
  Object.freeze({
    question: 'Does the guarantee cover every job, employer, salary, and city?',
    answer: 'Centaur Careers publishes a guarantee of a finance job for graduates and job switchers who complete the six-week program. The Placements page gives a summary, not the full cohort terms; request the current written terms before paying. The public claim does not specify a particular employer, salary, role, or city.',
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
