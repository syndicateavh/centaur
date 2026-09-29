import type { CourseTrack } from "@/data/courses";

const imageByTrack: Record<CourseTrack["slug"], string> = {
  "investment-banking-operations": "investment-banking-operations",
  "retail-banking-operations": "retail-banking",
  "kyc-aml-operations": "kyc-aml-compliance",
  "digital-payments-operations": "digital-payments",
  "finance-credit-operations": "finance-operations",
  "fintech-neo-banking-operations": "fintech-neo-banking",
};

export function getCourseImage(slug: CourseTrack["slug"]) {
  return `/images/courses/${imageByTrack[slug]}.webp`;
}
