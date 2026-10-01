import type { ReactNode } from "react";
import { requireLearner } from "@/lib/learner";
import LearnerNavigation from "@/components/learning/LearnerNavigation";

export default async function LearnerLayout({ children }: { children: ReactNode }) {
  const learner = await requireLearner();
  return <>
    <LearnerNavigation name={learner.name} />
    {children}
  </>;
}
