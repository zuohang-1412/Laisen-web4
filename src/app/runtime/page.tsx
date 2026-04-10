import type { Metadata } from "next";

import { RuntimeAiPlanStage } from "@/features/ai-planning/components/runtime-ai-plan-stage";

export const metadata: Metadata = {
  title: "Laisen Runtime",
  description: "Runtime AI planning module page.",
};

export default function RuntimePage() {
  return <RuntimeAiPlanStage />;
}
