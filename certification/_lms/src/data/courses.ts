export type CourseTrack = {
  slug: string;
  title: string;
  category: string;
  description: string;
  intendedRoles: string[];
  focusAreas: string[];
};

/** Proposed public topics. These are discovery pages, not published courses. */
export const courseTracks: CourseTrack[] = [
  {
    slug: "investment-banking-operations",
    title: "Investment Banking Operations",
    category: "Capital markets",
    description: "A proposed introduction to the teams and workflows that support investment banking transactions after a deal is agreed.",
    intendedRoles: ["Trade support analyst", "Middle-office analyst", "Investment banking operations analyst"],
    focusAreas: ["Trade lifecycle and confirmations", "Middle-office controls", "Exception handling and reconciliations"],
  },
  {
    slug: "retail-banking-operations",
    title: "Retail Banking Operations",
    category: "Banking operations",
    description: "A proposed role pathway covering common processes that support customer accounts, branch activity, and day-to-day banking services.",
    intendedRoles: ["Branch operations associate", "Customer operations analyst", "Account services associate"],
    focusAreas: ["Account servicing workflows", "Transaction processing", "Operational controls and escalation"],
  },
  {
    slug: "kyc-aml-operations",
    title: "KYC and AML Operations",
    category: "Financial crime operations",
    description: "A proposed foundation in customer due diligence, screening operations, and escalation concepts used in financial crime teams.",
    intendedRoles: ["KYC analyst", "AML operations associate", "Transaction monitoring analyst"],
    focusAreas: ["Customer due diligence concepts", "Screening and alert workflows", "Case documentation and escalation"],
  },
  {
    slug: "digital-payments-operations",
    title: "Digital Payments Operations",
    category: "Payments",
    description: "A proposed introduction to payment operations, exception queues, and the controls that support accurate payment processing.",
    intendedRoles: ["Payments operations analyst", "Payment investigations associate", "Reconciliation analyst"],
    focusAreas: ["Payment lifecycle concepts", "Returns and exception queues", "Settlement and reconciliation basics"],
  },
  {
    slug: "finance-credit-operations",
    title: "Finance and Credit Operations",
    category: "Finance operations",
    description: "A proposed pathway into finance operations and credit administration, with practical process concepts for entry-level roles.",
    intendedRoles: ["Credit operations associate", "Loan operations analyst", "Finance operations analyst"],
    focusAreas: ["Credit file and loan servicing concepts", "Financial operations workflows", "Reconciliations and control checks"],
  },
  {
    slug: "fintech-neo-banking-operations",
    title: "FinTech and Neo-banking Operations",
    category: "Digital finance",
    description: "A proposed overview of operational work in digital-first financial services, including customer journeys and service controls.",
    intendedRoles: ["FinTech operations associate", "Digital banking support analyst", "Service operations analyst"],
    focusAreas: ["Digital account journeys", "Operations and service controls", "Issue triage and escalation"],
  },
];

export function getCourseTrack(slug: string) {
  return courseTracks.find((course) => course.slug === slug);
}
